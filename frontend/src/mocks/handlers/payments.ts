import { http, HttpResponse, delay } from "msw";
import {
  getStoredInvoices,
  saveStoredInvoices,
  getStoredPayments,
  saveStoredPayments,
} from "../db";
import type { Payment } from "@/features/payments/schemas";

export const paymentsHandlers = [
  // GET /payments
  http.get("*/payments", async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const pageSize = Math.max(1, parseInt(url.searchParams.get("pageSize") || "20", 10));
    const search = (url.searchParams.get("search") || "").trim().toLowerCase();
    const invoiceId = url.searchParams.get("invoiceId");
    const method = url.searchParams.get("method");
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");
    const sort = url.searchParams.get("sort") || "createdAt:desc";

    // Customer scoping: if customer role token, filter by customerId
    const authHeader = request.headers.get("Authorization") || "";
    let customerFilterId: string | null = null;
    if (authHeader.includes("_customer_")) {
      customerFilterId = "cust_1";
    }

    let items = [...getStoredPayments()];

    if (customerFilterId) {
      items = items.filter((p) => p.customerId === customerFilterId);
    }

    if (invoiceId) {
      items = items.filter((p) => p.invoiceId === invoiceId);
    }

    if (method && method !== "all") {
      items = items.filter((p) => p.method === method);
    }

    if (dateFrom) {
      items = items.filter((p) => p.date >= dateFrom);
    }
    if (dateTo) {
      items = items.filter((p) => p.date <= dateTo);
    }

    if (search) {
      items = items.filter(
        (p) =>
          p.invoice.number.toLowerCase().includes(search) ||
          p.customer.name.toLowerCase().includes(search) ||
          p.note?.toLowerCase().includes(search)
      );
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
    const totalAmount = items.reduce((acc, curr) => acc + curr.amount, 0);

    const startIndex = (page - 1) * pageSize;
    const paginated = items.slice(startIndex, startIndex + pageSize);

    return HttpResponse.json({
      data: paginated,
      total,
      page,
      pageSize,
      totalAmount: Math.round(totalAmount * 100) / 100,
    });
  }),

  // GET /payments/:id
  http.get("*/payments/:id", async ({ params }) => {
    await delay(150);
    const payments = getStoredPayments();
    const payment = payments.find((p) => p.id === params.id);
    if (!payment) {
      return HttpResponse.json({ message: "Payment not found" }, { status: 404 });
    }
    return HttpResponse.json({ data: payment });
  }),

  // POST /invoices/:id/payments (Record a Payment)
  http.post("*/invoices/:id/payments", async ({ params, request }) => {
    await delay(300);
    const invoiceId = params.id as string;
    const body = (await request.json()) as {
      method: string;
      amount: number;
      date: string;
      note?: string;
    };

    const invoices = getStoredInvoices();
    const inv = invoices.find((i) => i.id === invoiceId);

    if (!inv) {
      return HttpResponse.json({ message: "Invoice not found" }, { status: 404 });
    }

    // Invoice must be confirmed
    if (inv.status !== "confirmed") {
      return HttpResponse.json(
        {
          message:
            inv.status === "paid"
              ? "Invoice is already paid in full."
              : `Cannot record payment for an invoice in '${inv.status}' status. Invoice must be confirmed.`,
        },
        { status: 409 }
      );
    }

    // Validate amount
    const amt = Number(body.amount);
    if (isNaN(amt) || amt <= 0) {
      return HttpResponse.json(
        {
          message: "Payment amount must be greater than zero.",
          errors: { amount: "Payment amount must be greater than zero." },
        },
        { status: 422 }
      );
    }

    if (amt > inv.balance + 0.01) {
      return HttpResponse.json(
        {
          message: `Payment amount cannot exceed remaining balance of ₹${inv.balance.toFixed(2)}`,
          errors: {
            amount: `Payment amount cannot exceed remaining balance of ₹${inv.balance.toFixed(2)}`,
          },
        },
        { status: 422 }
      );
    }

    // Validate date (cannot be in future)
    const selectedDate = new Date(body.date).getTime();
    const todayEnd = new Date().setHours(23, 59, 59, 999);
    if (selectedDate > todayEnd) {
      return HttpResponse.json(
        {
          message: "Payment date cannot be in the future.",
          errors: { date: "Payment date cannot be in the future." },
        },
        { status: 422 }
      );
    }

    // Create payment entity
    const paymentId = `pay_${Date.now()}`;
    const newPayment: Payment = {
      id: paymentId,
      invoiceId: inv.id,
      invoice: {
        id: inv.id,
        number: inv.number,
      },
      customerId: inv.customerId,
      customer: {
        id: inv.customer.id,
        name: inv.customer.name,
      },
      method: (body.method as any) || "bank_transfer",
      amount: Math.round(amt * 100) / 100,
      date: body.date,
      note: body.note || "",
      createdAt: new Date().toISOString(),
    };

    // Update invoice state
    inv.amountPaid = Math.round((inv.amountPaid + newPayment.amount) * 100) / 100;
    inv.balance = Math.max(0, Math.round((inv.total - inv.amountPaid) * 100) / 100);

    if (inv.balance === 0) {
      inv.status = "paid";
      inv.isOverdue = false;
    }

    inv.payments = inv.payments || [];
    inv.payments.push({
      id: newPayment.id,
      method: newPayment.method,
      amount: newPayment.amount,
      date: newPayment.date,
      note: newPayment.note,
    });

    saveStoredInvoices(invoices);

    const payments = getStoredPayments();
    payments.unshift(newPayment);
    saveStoredPayments(payments);

    return HttpResponse.json(
      {
        data: {
          payment: newPayment,
          invoice: inv,
        },
      },
      { status: 201 }
    );
  }),
];

