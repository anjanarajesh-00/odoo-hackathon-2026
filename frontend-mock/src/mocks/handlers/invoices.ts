import { http, HttpResponse, delay } from "msw";
import {
  getStoredInvoices,
  saveStoredInvoices,
  getStoredSubscriptions,
} from "../db";
import type { Invoice } from "@/features/invoices/schemas";

export const invoicesHandlers = [
  // GET /invoices
  http.get("*/invoices", async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const pageSize = Math.max(1, parseInt(url.searchParams.get("pageSize") || "20", 10));
    const search = (url.searchParams.get("search") || "").trim().toLowerCase();
    const status = url.searchParams.get("status");
    const overdue = url.searchParams.get("overdue");
    const customerId = url.searchParams.get("customerId");
    const subscriptionId = url.searchParams.get("subscriptionId");
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");
    const sort = url.searchParams.get("sort") || "createdAt:desc";

    let items = [...getStoredInvoices()];

    // Customer scoping: if customer role token, filter by customerId and exclude draft invoices
    const authHeader = request.headers.get("Authorization") || "";
    if (authHeader.includes("_customer_")) {
      const parts = authHeader.replace("Bearer ", "").split("_");
      const userId = parts[3];
      const customerId = userId === "usr_customer_1" ? "cust_1" : userId.replace("usr_", "cust_");
      items = items.filter((inv) => inv.customerId === customerId && inv.status !== "draft");
    }

    // Search filter (number or customer)
    if (search) {
      items = items.filter(
        (inv) =>
          inv.number.toLowerCase().includes(search) ||
          inv.customer.name.toLowerCase().includes(search) ||
          inv.subscription.number.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (status && status !== "all") {
      items = items.filter((inv) => inv.status === status);
    }

    // Overdue filter
    if (overdue === "true") {
      items = items.filter((inv) => inv.isOverdue);
    }

    // Customer filter
    if (customerId) {
      items = items.filter((inv) => inv.customerId === customerId);
    }

    // Subscription filter
    if (subscriptionId) {
      items = items.filter((inv) => inv.subscriptionId === subscriptionId);
    }

    // Date range filter
    if (dateFrom) {
      items = items.filter((inv) => inv.invoiceDate >= dateFrom);
    }
    if (dateTo) {
      items = items.filter((inv) => inv.invoiceDate <= dateTo);
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

  // GET /invoices/:id
  http.get("*/invoices/:id", async ({ params, request }) => {
    await delay(150);
    const invoices = getStoredInvoices();
    const invoice = invoices.find((inv) => inv.id === params.id);
    if (!invoice) {
      return HttpResponse.json({ message: "Invoice not found" }, { status: 404 });
    }

    const authHeader = request.headers.get("Authorization") || "";
    if (authHeader.includes("_customer_")) {
      const parts = authHeader.replace("Bearer ", "").split("_");
      const userId = parts[3];
      const customerId = userId === "usr_customer_1" ? "cust_1" : userId.replace("usr_", "cust_");
      if (invoice.customerId !== customerId || invoice.status === "draft") {
        return HttpResponse.json({ message: "Invoice not found" }, { status: 404 });
      }
    }

    return HttpResponse.json({ data: invoice });
  }),

  // POST /invoices/generate (Billing Day automated batch generation)
  http.post("*/invoices/generate", async ({ request }) => {
    await delay(500);
    const body = ((await request.json().catch(() => ({}))) || {}) as { asOfDate?: string };
    const asOfDate = body.asOfDate || new Date().toISOString().split("T")[0];

    const subscriptions = getStoredSubscriptions();
    const invoices = getStoredInvoices();

    let createdCount = 0;
    let skippedCount = 0;
    const createdIds: string[] = [];

    // Filter active subscriptions due on or before asOfDate
    const activeSubs = subscriptions.filter((s) => s.status === "active");

    for (const sub of activeSubs) {
      // Current billing period calculation
      const periodStart = asOfDate;
      const nextDate = new Date(new Date(asOfDate).getTime() + 30 * 86400000);
      const periodEnd = nextDate.toISOString().split("T")[0];

      // Check idempotency: "nothing billed twice"
      // If invoice already exists for this subscription and period, skip!
      const alreadyBilled = invoices.some(
        (inv) => inv.subscriptionId === sub.id && inv.periodStart === periodStart
      );

      if (alreadyBilled) {
        skippedCount++;
        continue;
      }

      const seq = invoices.length + createdCount + 1;
      const invNumber = `INV-2026-${String(seq).padStart(5, "0")}`;
      const invId = `inv_${Date.now()}_${createdCount}`;

      const dueDate = new Date(new Date(asOfDate).getTime() + 15 * 86400000).toISOString().split("T")[0];

      const lines = sub.lines.map((l, lIdx) => ({
        id: `line_${invId}_${lIdx}`,
        description: `${l.product.name}${l.variant ? ` (${l.variant.value})` : ""} - Subscription ${sub.number}`,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        taxAmount: l.taxes.reduce((sum, t) => sum + t.amount, 0),
        discountAmount: l.discountAmount || 0,
        amount: l.amount,
      }));

      const newInv: Invoice = {
        id: invId,
        number: invNumber,
        status: "draft",
        isOverdue: false,
        customerId: sub.customerId,
        customer: {
          id: sub.customer.id,
          name: sub.customer.name,
          email: sub.customer.email,
        },
        subscriptionId: sub.id,
        subscription: {
          id: sub.id,
          number: sub.number,
        },
        periodStart,
        periodEnd,
        invoiceDate: asOfDate,
        dueDate,
        lines,
        subtotal: sub.subtotal,
        taxTotal: sub.taxTotal,
        discountTotal: sub.discountTotal || 0,
        total: sub.total,
        amountPaid: 0,
        balance: sub.total,
        payments: [],
        createdAt: new Date().toISOString(),
      };

      invoices.unshift(newInv);
      createdIds.push(invId);
      createdCount++;
    }

    saveStoredInvoices(invoices);

    return HttpResponse.json({
      data: {
        created: createdCount,
        skipped: skippedCount,
        invoiceIds: createdIds,
      },
    });
  }),

  // POST /invoices (manual creation from single subscription)
  http.post("*/invoices", async ({ request }) => {
    await delay(250);
    const body = (await request.json()) as { subscriptionId: string };
    const subscriptions = getStoredSubscriptions();
    const sub = subscriptions.find((s) => s.id === body.subscriptionId);

    if (!sub) {
      return HttpResponse.json({ message: "Subscription not found" }, { status: 404 });
    }

    const invoices = getStoredInvoices();
    const today = new Date().toISOString().split("T")[0];
    const dueDate = new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0];

    // Idempotency check for current period
    const existing = invoices.find(
      (inv) => inv.subscriptionId === sub.id && inv.periodStart === today
    );
    if (existing) {
      return HttpResponse.json(
        { message: "An invoice has already been generated for this subscription today." },
        { status: 409 }
      );
    }

    const seq = invoices.length + 1;
    const invNumber = `INV-2026-${String(seq).padStart(5, "0")}`;
    const invId = `inv_${Date.now()}`;

    const lines = sub.lines.map((l, lIdx) => ({
      id: `line_${invId}_${lIdx}`,
      description: `${l.product.name}${l.variant ? ` (${l.variant.value})` : ""} - Subscription ${sub.number}`,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      taxAmount: l.taxes.reduce((sum, t) => sum + t.amount, 0),
      discountAmount: l.discountAmount || 0,
      amount: l.amount,
    }));

    const newInv: Invoice = {
      id: invId,
      number: invNumber,
      status: "draft",
      isOverdue: false,
      customerId: sub.customerId,
      customer: {
        id: sub.customer.id,
        name: sub.customer.name,
        email: sub.customer.email,
      },
      subscriptionId: sub.id,
      subscription: {
        id: sub.id,
        number: sub.number,
      },
      periodStart: today,
      periodEnd: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      invoiceDate: today,
      dueDate,
      lines,
      subtotal: sub.subtotal,
      taxTotal: sub.taxTotal,
      discountTotal: sub.discountTotal || 0,
      total: sub.total,
      amountPaid: 0,
      balance: sub.total,
      payments: [],
      createdAt: new Date().toISOString(),
    };

    invoices.unshift(newInv);
    saveStoredInvoices(invoices);

    return HttpResponse.json({ data: newInv }, { status: 201 });
  }),

  // POST /invoices/:id/confirm
  http.post("*/invoices/:id/confirm", async ({ params }) => {
    await delay(200);
    const invoices = getStoredInvoices();
    const inv = invoices.find((i) => i.id === params.id);

    if (!inv) return HttpResponse.json({ message: "Invoice not found" }, { status: 404 });

    if (inv.status !== "draft") {
      return HttpResponse.json(
        { message: `Cannot confirm invoice in '${inv.status}' state. Only draft invoices can be confirmed.` },
        { status: 409 }
      );
    }

    inv.status = "confirmed";
    saveStoredInvoices(invoices);
    return HttpResponse.json({ data: inv });
  }),

  // POST /invoices/:id/cancel
  http.post("*/invoices/:id/cancel", async ({ params }) => {
    await delay(200);
    const invoices = getStoredInvoices();
    const inv = invoices.find((i) => i.id === params.id);

    if (!inv) return HttpResponse.json({ message: "Invoice not found" }, { status: 404 });

    if (inv.payments && inv.payments.length > 0) {
      return HttpResponse.json(
        { message: "Cannot cancel an invoice with recorded payments." },
        { status: 409 }
      );
    }

    if (inv.status === "cancelled") {
      return HttpResponse.json({ message: "Invoice is already cancelled." }, { status: 409 });
    }

    inv.status = "cancelled";
    inv.isOverdue = false;
    saveStoredInvoices(invoices);
    return HttpResponse.json({ data: inv });
  }),

  // POST /invoices/:id/send
  http.post("*/invoices/:id/send", async ({ params }) => {
    await delay(200);
    const invoices = getStoredInvoices();
    const inv = invoices.find((i) => i.id === params.id);

    if (!inv) return HttpResponse.json({ message: "Invoice not found" }, { status: 404 });

    if (inv.status !== "confirmed" && inv.status !== "paid") {
      return HttpResponse.json(
        { message: `Cannot send invoice in '${inv.status}' state. Must be confirmed or paid.` },
        { status: 409 }
      );
    }

    return HttpResponse.json({
      message: `Invoice ${inv.number} sent to ${inv.customer.email || "customer"}`,
      data: inv,
    });
  }),
];
