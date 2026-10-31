import { http, HttpResponse, delay } from "msw";
import {
  getStoredSubscriptions,
  saveStoredSubscriptions,
  getStoredSubscriptionHistory,
  addStoredSubscriptionHistory,
  getStoredCustomers,
  getStoredPlans,
  getStoredProducts,
  getStoredTaxes,
  getStoredTemplates,
} from "../db";
import type {
  Subscription,
  SubscriptionFormInput,
  SubscriptionLineDetail,
} from "@/features/subscriptions/schemas";
import type { SubscriptionStatus } from "@/types/enums";

// Allowed transitions definition
const ALLOWED_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  draft: ["quotation"],
  quotation: ["confirmed"],
  confirmed: ["active", "closed"],
  active: ["closed"],
  closed: [],
};

export const subscriptionsHandlers = [
  // ----------------- Lookups -----------------
  http.get("*/customers", async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const search = (url.searchParams.get("search") || "").toLowerCase().trim();
    let customers = getStoredCustomers();
    if (search) {
      customers = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          c.company?.toLowerCase().includes(search)
      );
    }
    return HttpResponse.json({ data: customers });
  }),

  http.get("*/taxes", async () => {
    await delay(50);
    return HttpResponse.json({ data: getStoredTaxes() });
  }),

  http.get("*/quotation-templates", async () => {
    await delay(100);
    return HttpResponse.json({ data: getStoredTemplates() });
  }),

  // ----------------- Subscriptions CRUD & Lifecycle -----------------

  // GET /subscriptions
  http.get("*/subscriptions", async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const pageSize = Math.max(1, parseInt(url.searchParams.get("pageSize") || "20", 10));
    const search = (url.searchParams.get("search") || "").trim().toLowerCase();
    const status = url.searchParams.get("status");
    const planId = url.searchParams.get("planId");
    const customerId = url.searchParams.get("customerId");
    const expiringBefore = url.searchParams.get("expiringBefore");
    const sort = url.searchParams.get("sort") || "createdAt:desc";

    let items = [...getStoredSubscriptions()];

    // Customer scoping: if customer role token, filter by customerId
    const authHeader = request.headers.get("Authorization") || "";
    if (authHeader.includes("_customer_")) {
      const parts = authHeader.replace("Bearer ", "").split("_");
      // token format: mock_jwt_token_{userId}_{role}_{timestamp}
      // If usr_customer_1, customerId is cust_1; else cust_{timestamp}
      const userId = parts[3];
      const customerId = userId === "usr_customer_1" ? "cust_1" : userId.replace("usr_", "cust_");
      items = items.filter((s) => s.customerId === customerId);
    }

    // Search filter (number or customer name)
    if (search) {
      items = items.filter(
        (s) =>
          s.number.toLowerCase().includes(search) ||
          s.customer.name.toLowerCase().includes(search) ||
          s.customer.email?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (status && status !== "all") {
      items = items.filter((s) => s.status === status);
    }

    // Plan filter
    if (planId && planId !== "all") {
      items = items.filter((s) => s.planId === planId);
    }

    // Customer filter
    if (customerId) {
      items = items.filter((s) => s.customerId === customerId);
    }

    // Expiring before filter (Needs attention chip: expiring within 30 days)
    if (expiringBefore) {
      const expDate = new Date(expiringBefore).getTime();
      const today = new Date().getTime();
      items = items.filter((s) => {
        const subExpiry = new Date(s.expiryDate).getTime();
        return subExpiry >= today && subExpiry <= expDate && s.status === "active";
      });
    }

    // Sort
    const [sortField, sortDir] = sort.split(":");
    items.sort((a, b) => {
      let valA: any = (a as any)[sortField];
      let valB: any = (b as any)[sortField];

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortDir === "desc" ? 1 : -1;
      if (valA > valB) return sortDir === "desc" ? -1 : 1;
      return 0;
    });

    const total = items.length;
    const startIndex = (page - 1) * pageSize;
    const paginated = items.slice(startIndex, startIndex + pageSize);

    return HttpResponse.json({
      data: paginated,
      total,
      page,
      pageSize,
    });
  }),

  // GET /subscriptions/:id
  http.get("*/subscriptions/:id", async ({ params, request }) => {
    await delay(150);
    const items = getStoredSubscriptions();
    const found = items.find((s) => s.id === params.id);
    if (!found) {
      return HttpResponse.json({ message: "Subscription not found" }, { status: 404 });
    }

    const authHeader = request.headers.get("Authorization") || "";
    if (authHeader.includes("_customer_")) {
      const parts = authHeader.replace("Bearer ", "").split("_");
      const userId = parts[3];
      const customerId = userId === "usr_customer_1" ? "cust_1" : userId.replace("usr_", "cust_");
      if (found.customerId !== customerId) {
        return HttpResponse.json({ message: "Subscription not found" }, { status: 404 });
      }
    }

    return HttpResponse.json({ data: found });
  }),

  // GET /subscriptions/:id/history
  http.get("*/subscriptions/:id/history", async ({ params }) => {
    await delay(100);
    const history = getStoredSubscriptionHistory(String(params.id));
    return HttpResponse.json({ data: history });
  }),

  // POST /subscriptions
  http.post("*/subscriptions", async ({ request }) => {
    await delay(250);
    const body = (await request.json()) as SubscriptionFormInput;

    const customers = getStoredCustomers();
    const plans = getStoredPlans();
    const products = getStoredProducts();
    const taxes = getStoredTaxes();

    const customer = customers.find((c) => c.id === body.customerId);
    const plan = plans.find((p) => p.id === body.planId);

    if (!customer) {
      return HttpResponse.json(
        { message: "Customer not found", errors: { customerId: "Selected customer does not exist" } },
        { status: 422 }
      );
    }
    if (!plan) {
      return HttpResponse.json(
        { message: "Plan not found", errors: { planId: "Selected plan does not exist" } },
        { status: 422 }
      );
    }

    // Validate minimum quantity on lines
    for (const [idx, line] of body.lines.entries()) {
      if (line.quantity < plan.minQuantity) {
        return HttpResponse.json(
          {
            message: `Minimum quantity for this plan is ${plan.minQuantity}`,
            errors: {
              [`lines.${idx}.quantity`]: `Minimum quantity for ${plan.name} is ${plan.minQuantity}`,
            },
          },
          { status: 422 }
        );
      }
    }

    // Build lines with computed amounts on the server
    let subtotal = 0;
    let taxTotal = 0;
    const computedLines: SubscriptionLineDetail[] = [];

    for (let i = 0; i < body.lines.length; i++) {
      const inputLine = body.lines[i];
      const product = products.find((p) => p.id === inputLine.productId);
      if (!product) continue;

      const variant = product.variants?.find((v) => v.id === inputLine.variantId);
      const unitPrice = product.salesPrice + (variant ? variant.extraPrice : 0);
      const lineSubtotal = unitPrice * inputLine.quantity;

      const selectedTaxes = (inputLine.taxIds || [])
        .map((tid) => taxes.find((t) => t.id === tid))
        .filter(Boolean) as typeof taxes;

      const lineTaxDetails = selectedTaxes.map((t) => ({
        id: t.id,
        name: t.name,
        amount: Math.round(lineSubtotal * t.rate * 100) / 100,
      }));

      const lineTaxSum = lineTaxDetails.reduce((sum, t) => sum + t.amount, 0);

      subtotal += lineSubtotal;
      taxTotal += lineTaxSum;

      computedLines.push({
        id: `line_${Date.now()}_${i}`,
        productId: product.id,
        product: { id: product.id, name: product.name, salesPrice: product.salesPrice },
        variantId: variant?.id,
        variant: variant ? { id: variant.id || "", value: variant.value, extraPrice: variant.extraPrice } : undefined,
        quantity: inputLine.quantity,
        unitPrice,
        taxes: lineTaxDetails,
        discountAmount: 0,
        amount: Math.round(lineSubtotal * 100) / 100,
      });
    }

    const items = getStoredSubscriptions();
    const newSeq = items.length + 1;
    const subNumber = `SUB-2026-${String(newSeq).padStart(5, "0")}`;
    const subId = `sub_${Date.now()}`;

    const newSub: Subscription = {
      id: subId,
      number: subNumber,
      status: "draft",
      customerId: customer.id,
      customer: { id: customer.id, name: customer.name, email: customer.email },
      planId: plan.id,
      plan: { id: plan.id, name: plan.name, billingPeriod: plan.billingPeriod, minQuantity: plan.minQuantity },
      startDate: body.startDate,
      expiryDate: body.expiryDate,
      quotationValidUntil: body.quotationValidUntil || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      paymentTerms: body.paymentTerms,
      lines: computedLines,
      subtotal: Math.round(subtotal * 100) / 100,
      taxTotal: Math.round(taxTotal * 100) / 100,
      discountTotal: 0,
      total: Math.round((subtotal + taxTotal) * 100) / 100,
      createdAt: new Date().toISOString(),
    };

    items.unshift(newSub);
    saveStoredSubscriptions(items);

    addStoredSubscriptionHistory(subId, {
      from: "created",
      to: "draft",
      by: "Staff Member",
      at: new Date().toISOString(),
      note: "Subscription initialized as draft",
    });

    return HttpResponse.json({ data: newSub }, { status: 201 });
  }),

  // PATCH /subscriptions/:id
  http.patch("*/subscriptions/:id", async ({ params, request }) => {
    await delay(200);
    const body = (await request.json()) as SubscriptionFormInput;
    const items = getStoredSubscriptions();
    const sub = items.find((s) => s.id === params.id);

    if (!sub) {
      return HttpResponse.json({ message: "Subscription not found" }, { status: 404 });
    }

    if (sub.status !== "draft" && sub.status !== "quotation") {
      return HttpResponse.json(
        { message: `Cannot edit subscription in '${sub.status}' state. Only Draft or Quotation can be modified.` },
        { status: 409 }
      );
    }

    const plans = getStoredPlans();
    const plan = plans.find((p) => p.id === body.planId) || sub.plan;
    const products = getStoredProducts();
    const taxes = getStoredTaxes();

    // Recompute lines
    let subtotal = 0;
    let taxTotal = 0;
    const computedLines: SubscriptionLineDetail[] = [];

    for (let i = 0; i < (body.lines || []).length; i++) {
      const inputLine = body.lines[i];
      const product = products.find((p) => p.id === inputLine.productId);
      if (!product) continue;

      const variant = product.variants?.find((v) => v.id === inputLine.variantId);
      const unitPrice = product.salesPrice + (variant ? variant.extraPrice : 0);
      const lineSubtotal = unitPrice * inputLine.quantity;

      const selectedTaxes = (inputLine.taxIds || [])
        .map((tid) => taxes.find((t) => t.id === tid))
        .filter(Boolean) as typeof taxes;

      const lineTaxDetails = selectedTaxes.map((t) => ({
        id: t.id,
        name: t.name,
        amount: Math.round(lineSubtotal * t.rate * 100) / 100,
      }));

      subtotal += lineSubtotal;
      taxTotal += lineTaxDetails.reduce((sum, t) => sum + t.amount, 0);

      computedLines.push({
        id: `line_${Date.now()}_${i}`,
        productId: product.id,
        product: { id: product.id, name: product.name, salesPrice: product.salesPrice },
        variantId: variant?.id,
        variant: variant ? { id: variant.id || "", value: variant.value, extraPrice: variant.extraPrice } : undefined,
        quantity: inputLine.quantity,
        unitPrice,
        taxes: lineTaxDetails,
        discountAmount: 0,
        amount: Math.round(lineSubtotal * 100) / 100,
      });
    }

    sub.startDate = body.startDate || sub.startDate;
    sub.expiryDate = body.expiryDate || sub.expiryDate;
    sub.quotationValidUntil = body.quotationValidUntil || sub.quotationValidUntil;
    sub.paymentTerms = body.paymentTerms || sub.paymentTerms;
    sub.lines = computedLines.length > 0 ? computedLines : sub.lines;
    sub.subtotal = Math.round(subtotal * 100) / 100;
    sub.taxTotal = Math.round(taxTotal * 100) / 100;
    sub.total = Math.round((subtotal + taxTotal) * 100) / 100;

    saveStoredSubscriptions(items);
    return HttpResponse.json({ data: sub });
  }),

  // POST /subscriptions/:id/transition
  http.post("*/subscriptions/:id/transition", async ({ params, request }) => {
    await delay(200);
    const body = (await request.json()) as { to: SubscriptionStatus };
    const items = getStoredSubscriptions();
    const sub = items.find((s) => s.id === params.id);

    if (!sub) {
      return HttpResponse.json({ message: "Subscription not found" }, { status: 404 });
    }

    const allowed = ALLOWED_TRANSITIONS[sub.status] || [];
    if (!allowed.includes(body.to)) {
      return HttpResponse.json(
        {
          message: `Transition from '${sub.status}' to '${body.to}' is not allowed. Expected: ${allowed.join(", ") || "None"}`,
        },
        { status: 409 }
      );
    }

    // Role check from Bearer token
    const authHeader = request.headers.get("Authorization") || "";
    const isAdmin = authHeader.includes("_admin_");

    // Only admin may Close an active subscription
    if (body.to === "closed" && !isAdmin) {
      return HttpResponse.json(
        { message: "Only administrators have permission to close subscriptions." },
        { status: 403 }
      );
    }

    const previousStatus = sub.status;
    sub.status = body.to;

    if (body.to === "active") {
      sub.nextInvoiceDate = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
    }

    saveStoredSubscriptions(items);

    addStoredSubscriptionHistory(sub.id, {
      from: previousStatus,
      to: body.to,
      by: isAdmin ? "Admin User" : "Staff Member",
      at: new Date().toISOString(),
      note: `Transitioned from ${previousStatus} to ${body.to}`,
    });

    return HttpResponse.json({ data: sub });
  }),

  // POST /subscriptions/:id/renew
  http.post("*/subscriptions/:id/renew", async ({ params, request }) => {
    await delay(200);
    const items = getStoredSubscriptions();
    const sub = items.find((s) => s.id === params.id);

    if (!sub) {
      return HttpResponse.json({ message: "Subscription not found" }, { status: 404 });
    }

    const authHeader = request.headers.get("Authorization") || "";
    const isAdmin = authHeader.includes("_admin_");
    if (!isAdmin) {
      return HttpResponse.json(
        { message: "Only administrators have permission to renew subscriptions." },
        { status: 403 }
      );
    }

    if (sub.status !== "active") {
      return HttpResponse.json(
        { message: `Cannot renew a subscription that is in '${sub.status}' status. Must be active.` },
        { status: 409 }
      );
    }

    // Extend expiry by 1 year or 30 days based on plan
    const curExpiry = new Date(sub.expiryDate);
    curExpiry.setFullYear(curExpiry.getFullYear() + 1);
    sub.expiryDate = curExpiry.toISOString().split("T")[0];

    saveStoredSubscriptions(items);

    addStoredSubscriptionHistory(sub.id, {
      from: sub.status,
      to: sub.status,
      by: "Admin User",
      at: new Date().toISOString(),
      note: `Subscription extended to ${sub.expiryDate}`,
    });

    return HttpResponse.json({ data: sub });
  }),
];

