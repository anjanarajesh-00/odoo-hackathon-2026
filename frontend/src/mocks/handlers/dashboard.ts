import { http, HttpResponse, delay } from "msw";
import {
  getStoredSubscriptions,
  getStoredInvoices,
  getStoredPayments,
} from "../db";
import type {
  DashboardSummary,
  RevenueTrendPoint,
  SubscriptionsByStatusItem,
  OverdueInvoiceItem,
  TrendGroupBy,
} from "@/features/dashboard/schemas";

export const dashboardHandlers = [
  // GET /dashboard/summary
  http.get("*/dashboard/summary", async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const dateFrom = url.searchParams.get("dateFrom") || "";
    const dateTo = url.searchParams.get("dateTo") || "";

    const subscriptions = getStoredSubscriptions();
    const invoices = getStoredInvoices();
    const payments = getStoredPayments();

    // 1. Active Subscriptions count
    const activeSubs = subscriptions.filter((s) => s.status === "active");
    const activeSubscriptions = activeSubs.length;

    // 2. MRR (Normalized monthly recurring revenue of active subs)
    let mrr = 0;
    activeSubs.forEach((s) => {
      const period = s.plan.billingPeriod;
      if (period === "yearly") {
        mrr += s.total / 12;
      } else if (period === "weekly") {
        mrr += (s.total * 52) / 12;
      } else if (period === "daily") {
        mrr += s.total * 30;
      } else {
        // default monthly
        mrr += s.total;
      }
    });

    // 3. Revenue collected in the date range
    let rangePayments = [...payments];
    if (dateFrom) rangePayments = rangePayments.filter((p) => p.date >= dateFrom);
    if (dateTo) rangePayments = rangePayments.filter((p) => p.date <= dateTo);
    const revenueCollected = rangePayments.reduce((acc, p) => acc + p.amount, 0);

    // 4. Invoices in scope
    let rangeInvoices = [...invoices];
    if (dateFrom) rangeInvoices = rangeInvoices.filter((i) => i.invoiceDate >= dateFrom);
    if (dateTo) rangeInvoices = rangeInvoices.filter((i) => i.invoiceDate <= dateTo);

    // Outstanding amount = sum of balance on confirmed invoices
    const confirmedInvoices = rangeInvoices.filter((i) => i.status === "confirmed");
    const outstandingAmount = confirmedInvoices.reduce((acc, i) => acc + i.balance, 0);

    // Overdue count and amount
    const overdueInvoices = rangeInvoices.filter((i) => i.isOverdue);
    const overdueCount = overdueInvoices.length;
    const overdueAmount = overdueInvoices.reduce((acc, i) => acc + i.balance, 0);

    const paidInvoices = rangeInvoices.filter((i) => i.status === "paid").length;
    const unpaidInvoices = rangeInvoices.filter((i) => i.status !== "paid" && i.status !== "cancelled").length;

    const summary: DashboardSummary = {
      activeSubscriptions,
      mrr: Math.round(mrr * 100) / 100,
      revenueCollected: Math.round(revenueCollected * 100) / 100,
      outstandingAmount: Math.round(outstandingAmount * 100) / 100,
      overdueCount,
      overdueAmount: Math.round(overdueAmount * 100) / 100,
      paidInvoices,
      unpaidInvoices,
    };

    return HttpResponse.json({ data: summary });
  }),

  // GET /dashboard/revenue-trend
  http.get("*/dashboard/revenue-trend", async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const dateFrom = url.searchParams.get("dateFrom") || "";
    const dateTo = url.searchParams.get("dateTo") || "";
    let groupBy = url.searchParams.get("groupBy") as TrendGroupBy | null;

    // Automatically pick groupBy if not explicitly overridden
    if (!groupBy) {
      if (dateFrom && dateTo) {
        const diffDays = Math.ceil(
          (new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays <= 31) groupBy = "day";
        else if (diffDays <= 90) groupBy = "week";
        else groupBy = "month";
      } else {
        groupBy = "month";
      }
    }

    const payments = getStoredPayments();
    let filtered = [...payments];
    if (dateFrom) filtered = filtered.filter((p) => p.date >= dateFrom);
    if (dateTo) filtered = filtered.filter((p) => p.date <= dateTo);

    // Bucket payments
    const buckets: Record<string, { label: string; revenue: number }> = {};

    filtered.forEach((p) => {
      const pDate = new Date(p.date);
      let key = "";
      let label = "";

      if (groupBy === "day") {
        key = p.date;
        label = pDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      } else if (groupBy === "week") {
        // Simple weekly key: Year + Week
        const oneJan = new Date(pDate.getFullYear(), 0, 1);
        const numberOfDays = Math.floor((pDate.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
        const weekNum = Math.ceil((pDate.getDay() + 1 + numberOfDays) / 7);
        key = `${pDate.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
        label = `Wk ${weekNum}`;
      } else {
        // month
        key = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, "0")}`;
        label = pDate.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      }

      if (!buckets[key]) {
        buckets[key] = { label, revenue: 0 };
      }
      buckets[key].revenue += p.amount;
    });

    // Sort buckets chronologically
    const sortedKeys = Object.keys(buckets).sort();
    let trend: RevenueTrendPoint[] = sortedKeys.map((k) => ({
      period: k,
      label: buckets[k].label,
      revenue: Math.round(buckets[k].revenue * 100) / 100,
    }));

    // If empty, provide a few placeholder zero points within range
    if (trend.length === 0) {
      trend = [
        { period: "start", label: "Start", revenue: 0 },
        { period: "end", label: "End", revenue: 0 },
      ];
    }

    return HttpResponse.json({ data: trend });
  }),

  // GET /dashboard/subscriptions-by-status
  http.get("*/dashboard/subscriptions-by-status", async () => {
    await delay(250);
    const subscriptions = getStoredSubscriptions();

    const counts: Record<string, number> = {
      draft: 0,
      quotation: 0,
      confirmed: 0,
      active: 0,
      closed: 0,
    };

    subscriptions.forEach((s) => {
      if (counts[s.status] !== undefined) {
        counts[s.status]++;
      }
    });

    const data: SubscriptionsByStatusItem[] = [
      { status: "active", count: counts.active },
      { status: "confirmed", count: counts.confirmed },
      { status: "quotation", count: counts.quotation },
      { status: "draft", count: counts.draft },
      { status: "closed", count: counts.closed },
    ];

    return HttpResponse.json({ data });
  }),

  // GET /dashboard/overdue-invoices
  http.get("*/dashboard/overdue-invoices", async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const pageSize = Math.max(1, parseInt(url.searchParams.get("pageSize") || "5", 10));

    const invoices = getStoredInvoices();
    const now = new Date().getTime();

    // Filter overdue invoices
    const overdueList: OverdueInvoiceItem[] = invoices
      .filter((i) => i.isOverdue)
      .map((i) => {
        const dueTime = new Date(i.dueDate).getTime();
        const daysOverdue = Math.max(1, Math.floor((now - dueTime) / (1000 * 60 * 60 * 24)));
        return {
          ...i,
          daysOverdue,
        };
      });

    // Sort by daysOverdue desc
    overdueList.sort((a, b) => b.daysOverdue - a.daysOverdue);

    const total = overdueList.length;
    const startIndex = (page - 1) * pageSize;
    const paginated = overdueList.slice(startIndex, startIndex + pageSize);

    return HttpResponse.json({
      data: paginated,
      total,
      page,
      pageSize,
    });
  }),
];

