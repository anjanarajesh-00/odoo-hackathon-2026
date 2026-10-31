import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  DashboardSummary,
  RevenueTrendPoint,
  SubscriptionsByStatusItem,
  OverdueInvoiceItem,
  DashboardDateRange,
  TrendGroupBy,
} from "./schemas";

export function useDashboardSummary(range: DashboardDateRange) {
  return useQuery({
    queryKey: ["dashboard", "summary", range],
    queryFn: async () => {
      const res = await apiClient.get<{ data: DashboardSummary }>("/dashboard/summary", {
        params: {
          dateFrom: range.dateFrom,
          dateTo: range.dateTo,
        },
      });
      return res.data.data;
    },
    staleTime: 30000,
    placeholderData: keepPreviousData,
  });
}

export function useRevenueTrend(range: DashboardDateRange, groupBy?: TrendGroupBy) {
  return useQuery({
    queryKey: ["dashboard", "revenue-trend", range, groupBy],
    queryFn: async () => {
      const res = await apiClient.get<{ data: RevenueTrendPoint[] }>("/dashboard/revenue-trend", {
        params: {
          dateFrom: range.dateFrom,
          dateTo: range.dateTo,
          groupBy,
        },
      });
      return res.data.data;
    },
    staleTime: 30000,
    placeholderData: keepPreviousData,
  });
}

export function useSubscriptionsByStatus(range: DashboardDateRange) {
  return useQuery({
    queryKey: ["dashboard", "subscriptions-by-status", range],
    queryFn: async () => {
      const res = await apiClient.get<any>(
        "/dashboard/subscriptions-by-status",
        {
          params: {
            dateFrom: range.dateFrom,
            dateTo: range.dateTo,
          },
        }
      );
      const raw = res.data?.data || res.data;
      if (Array.isArray(raw)) return raw;
      if (raw && typeof raw === "object") {
        return Object.entries(raw).map(([status, count]) => ({
          status: status as any,
          count: Number(count),
        }));
      }
      return [];
    },
    staleTime: 30000,
    placeholderData: keepPreviousData,
  });
}

export function useOverdueInvoices(
  range: DashboardDateRange,
  pagination: { page: number; pageSize: number }
) {
  return useQuery({
    queryKey: ["dashboard", "overdue-invoices", range, pagination],
    queryFn: async () => {
      const res = await apiClient.get<{
        data: OverdueInvoiceItem[];
        total: number;
        page: number;
        pageSize: number;
      }>("/dashboard/overdue-invoices", {
        params: {
          dateFrom: range.dateFrom,
          dateTo: range.dateTo,
          page: pagination.page,
          pageSize: pagination.pageSize,
        },
      });
      return res.data;
    },
    staleTime: 30000,
    placeholderData: keepPreviousData,
  });
}

