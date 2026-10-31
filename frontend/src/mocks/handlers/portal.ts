import { http, HttpResponse, delay } from "msw";
import { getStoredSubscriptions, getStoredInvoices } from "../db";
import type { PortalSummary } from "@/features/portal/schemas";

export const portalHandlers = [
  // GET /portal/summary
  http.get("*/portal/summary", async ({ request }) => {
    await delay(250);
    const authHeader = request.headers.get("Authorization") || "";
    let customerId = "cust_1";
    if (authHeader.includes("_customer_")) {
      const parts = authHeader.replace("Bearer ", "").split("_");
      const userId = parts[3];
      customerId = userId === "usr_customer_1" ? "cust_1" : userId.replace("usr_", "cust_");
    }

    const subscriptions = getStoredSubscriptions().filter((s) => s.customerId === customerId);
    const invoices = getStoredInvoices().filter(
      (i) => i.customerId === customerId && i.status !== "draft"
    );

    // Active subscriptions count
    const activeSubs = subscriptions.filter((s) => s.status === "active");
    const activeSubscriptions = activeSubs.length;

    // Outstanding amount = sum of balance on confirmed invoices
    const confirmedInvoices = invoices.filter((i) => i.status === "confirmed");
    const outstandingAmount = confirmedInvoices.reduce((acc, i) => acc + i.balance, 0);

    // Overdue count
    const overdueCount = invoices.filter((i) => i.isOverdue).length;

    // Next invoice calculation: find the nearest nextInvoiceDate among active subscriptions
    let nextInvoiceDate: string | null = null;
    let nextInvoiceAmount = 0;

    const subsWithNextDate = activeSubs
      .filter((s) => s.nextInvoiceDate)
      .sort((a, b) => new Date(a.nextInvoiceDate!).getTime() - new Date(b.nextInvoiceDate!).getTime());

    if (subsWithNextDate.length > 0) {
      nextInvoiceDate = subsWithNextDate[0].nextInvoiceDate!;
      nextInvoiceAmount = subsWithNextDate[0].total;
    }

    const summary: PortalSummary = {
      activeSubscriptions,
      outstandingAmount: Math.round(outstandingAmount * 100) / 100,
      overdueCount,
      nextInvoiceDate,
      nextInvoiceAmount: Math.round(nextInvoiceAmount * 100) / 100,
    };

    return HttpResponse.json({ data: summary });
  }),
];

