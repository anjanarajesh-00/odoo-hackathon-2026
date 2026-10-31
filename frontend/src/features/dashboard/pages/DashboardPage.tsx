import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "../components/StatCard";
import { DateRangeFilter } from "../components/DateRangeFilter";
import { RevenueTrendChart } from "../components/RevenueTrendChart";
import { StatusDonut } from "../components/StatusDonut";
import { OverdueTable } from "../components/OverdueTable";
import {
  useDashboardSummary,
  useRevenueTrend,
  useSubscriptionsByStatus,
  useOverdueInvoices,
} from "../api";
import { formatCurrency } from "@/lib/formatters";
import type { TrendGroupBy } from "../schemas";
import {
  Users,
  CreditCard,
  Receipt,
  AlertTriangle,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Date range state in URL search params (default to This Month)
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const defaultTo = now.toISOString().split("T")[0];

  const dateFrom = searchParams.get("dateFrom") || defaultFrom;
  const dateTo = searchParams.get("dateTo") || defaultTo;
  const preset = searchParams.get("preset") || "this_month";
  const overduePage = parseInt(searchParams.get("overduePage") || "1", 10);

  const range = { dateFrom, dateTo, preset };

  const updateRange = (newRange: { dateFrom: string; dateTo: string; preset: string }) => {
    const next = new URLSearchParams(searchParams);
    next.set("dateFrom", newRange.dateFrom);
    next.set("dateTo", newRange.dateTo);
    next.set("preset", newRange.preset);
    setSearchParams(next, { replace: true });
  };

  const updateOverduePage = (p: { page: number; pageSize: number }) => {
    const next = new URLSearchParams(searchParams);
    next.set("overduePage", String(p.page));
    setSearchParams(next, { replace: true });
  };

  // GroupBy local override state
  const [overrideGroupBy, setOverrideGroupBy] = useState<TrendGroupBy | undefined>(undefined);

  // Queries
  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useDashboardSummary(range);

  const {
    data: trendData,
    isLoading: isTrendLoading,
    isError: isTrendError,
    refetch: refetchTrend,
  } = useRevenueTrend(range, overrideGroupBy);

  const {
    data: statusData,
    isLoading: isStatusLoading,
    isError: isStatusError,
    refetch: refetchStatus,
  } = useSubscriptionsByStatus(range);

  const {
    data: overdueData,
    isLoading: isOverdueLoading,
    isError: isOverdueError,
    refetch: refetchOverdue,
  } = useOverdueInvoices(range, { page: overduePage, pageSize: 5 });

  // Effective groupBy computation for toggle display
  const effectiveGroupBy: TrendGroupBy =
    overrideGroupBy ||
    (() => {
      const diffDays = Math.ceil(
        (new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays <= 31) return "day";
      if (diffDays <= 90) return "week";
      return "month";
    })();

  return (
    <div className="space-y-6">
      {/* PageHeader with Shared Date Range Filter */}
      <PageHeader
        title="Finance Dashboard"
        description="Real-time recurring revenue metrics, monthly run-rate, and overdue billing reconciliation."
        actions={
          <DateRangeFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            preset={preset}
            onChange={updateRange}
          />
        }
      />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Active Subscriptions (with MRR tooltip/subtitle) */}
        <StatCard
          title="Active Subscriptions"
          value={summary?.activeSubscriptions ?? 0}
          subtitle={`MRR: ${formatCurrency(summary?.mrr ?? 0)}`}
          icon={Users}
          href="/subscriptions?status=active"
          isLoading={isSummaryLoading}
          isError={isSummaryError}
          onRetry={refetchSummary}
          tooltip={`Monthly Recurring Revenue: ${formatCurrency(summary?.mrr ?? 0)}`}
        />

        {/* 2. Revenue Collected */}
        <StatCard
          title="Revenue Collected"
          value={formatCurrency(summary?.revenueCollected ?? 0)}
          subtitle={`${summary?.paidInvoices ?? 0} invoices settled`}
          icon={CreditCard}
          href={`/payments?dateFrom=${dateFrom}&dateTo=${dateTo}`}
          isLoading={isSummaryLoading}
          isError={isSummaryError}
          onRetry={refetchSummary}
        />

        {/* 3. Outstanding Amount */}
        <StatCard
          title="Outstanding Amount"
          value={formatCurrency(summary?.outstandingAmount ?? 0)}
          subtitle={`${summary?.unpaidInvoices ?? 0} pending invoices`}
          icon={Receipt}
          href="/invoices?status=confirmed"
          isLoading={isSummaryLoading}
          isError={isSummaryError}
          onRetry={refetchSummary}
        />

        {/* 4. Overdue Invoices */}
        <StatCard
          title="Overdue Invoices"
          value={summary?.overdueCount ?? 0}
          subtitle={`Amount: ${formatCurrency(summary?.overdueAmount ?? 0)}`}
          icon={AlertTriangle}
          href="/invoices?overdue=true"
          isLoading={isSummaryLoading}
          isError={isSummaryError}
          onRetry={refetchSummary}
        />
      </div>

      {/* 2 Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueTrendChart
          data={trendData}
          isLoading={isTrendLoading}
          isError={isTrendError}
          onRetry={refetchTrend}
          groupBy={effectiveGroupBy}
          onGroupByChange={setOverrideGroupBy}
        />

        <StatusDonut
          data={statusData}
          isLoading={isStatusLoading}
          isError={isStatusError}
          onRetry={refetchStatus}
        />
      </div>

      {/* Overdue Invoices Table */}
      <OverdueTable
        data={overdueData?.data}
        total={overdueData?.total}
        isLoading={isOverdueLoading}
        isError={isOverdueError}
        onRetry={refetchOverdue}
        page={overduePage}
        pageSize={5}
        onPaginationChange={updateOverduePage}
      />
    </div>
  );
};

