import { z } from "zod";
import type { SubscriptionStatus } from "@/types/enums";
import type { Invoice } from "@/features/invoices/schemas";

export interface DashboardSummary {
  activeSubscriptions: number;
  mrr: number;
  revenueCollected: number;
  outstandingAmount: number;
  overdueCount: number;
  overdueAmount: number;
  paidInvoices: number;
  unpaidInvoices: number;
}

export interface RevenueTrendPoint {
  period: string; // e.g., "2026-05", "2026-W22", "2026-05-15"
  label: string;  // formatted label for chart tooltip & x-axis
  revenue: number;
}

export interface SubscriptionsByStatusItem {
  status: SubscriptionStatus;
  count: number;
}

export interface OverdueInvoiceItem extends Invoice {
  daysOverdue: number;
}

export interface DashboardDateRange {
  dateFrom: string;
  dateTo: string;
  preset?: string;
}

export type TrendGroupBy = "day" | "week" | "month";

