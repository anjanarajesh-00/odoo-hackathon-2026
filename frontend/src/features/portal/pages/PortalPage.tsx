import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { useAuthStore } from "@/store/auth.store";
import { usePortalSummary } from "../api";
import { useSubscriptions } from "@/features/subscriptions/api";
import { useInvoices } from "@/features/invoices/api";
import type { Subscription } from "@/features/subscriptions/schemas";
import type { Invoice } from "@/features/invoices/schemas";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type PaginationState } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { FilterBar } from "@/components/shared/FilterBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  FileCheck2,
  Receipt,
  Calendar,
  AlertTriangle,
  CreditCard,
  Eye,
  Printer,
  Sparkles,
  RefreshCw,
  FolderOpen,
} from "lucide-react";

export const PortalPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab selection in URL params
  const currentTab = searchParams.get("tab") || "subscriptions";

  // Subscriptions tab query params
  const subPage = parseInt(searchParams.get("subPage") || "1", 10);
  const subPageSize = parseInt(searchParams.get("subPageSize") || "10", 10);
  const subSearch = searchParams.get("subSearch") || "";
  const subStatus = searchParams.get("subStatus") || "all";

  // Invoices tab query params
  const invPage = parseInt(searchParams.get("invPage") || "1", 10);
  const invPageSize = parseInt(searchParams.get("invPageSize") || "10", 10);
  const invSearch = searchParams.get("invSearch") || "";
  const invStatus = searchParams.get("invStatus") || "all";
  const invOverdue = searchParams.get("invOverdue") === "true";
  const invDateFrom = searchParams.get("invDateFrom") || "";
  const invDateTo = searchParams.get("invDateTo") || "";

  const updateParams = (updates: Record<string, string | number | boolean | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === "" || v === "all" || v === null || v === false) {
        next.delete(k);
      } else {
        next.set(k, String(v));
      }
    });
    setSearchParams(next, { replace: true });
  };

  // Queries
  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = usePortalSummary();

  const { data: subsData, isLoading: isSubsLoading } = useSubscriptions({
    page: subPage,
    pageSize: subPageSize,
    search: subSearch,
    status: subStatus === "all" ? undefined : subStatus,
  });

  const { data: invoicesData, isLoading: isInvoicesLoading } = useInvoices({
    page: invPage,
    pageSize: invPageSize,
    search: invSearch,
    status: invStatus === "all" ? undefined : invStatus,
    overdue: invOverdue ? true : undefined,
    dateFrom: invDateFrom || undefined,
    dateTo: invDateTo || undefined,
  });

  // Customer's Subscriptions Table Columns (reduced set: no customer column, no create/edit)
  const subColumns: ColumnDef<Subscription>[] = [
    {
      accessorKey: "number",
      header: "Subscription #",
      cell: ({ row }) => (
        <span className="font-semibold text-primary hover:underline cursor-pointer">
          {row.original.number}
        </span>
      ),
    },
    {
      accessorKey: "plan",
      header: "Plan Tier",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-foreground">
            {row.original.plan.name}
          </div>
          <div className="text-xs text-muted-foreground capitalize">
            {row.original.plan.billingPeriod} billing
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatDate(row.original.startDate)}</span>
      ),
    },
    {
      accessorKey: "expiryDate",
      header: "Renewal / Expiry",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatDate(row.original.expiryDate)}</span>
      ),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-bold text-foreground">
          {formatCurrency(row.original.total)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <button
            onClick={() => navigate(`/subscriptions/${row.original.id}`)}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
            title="View Contract"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Customer's Invoices Table Columns (View and Print only)
  const invoiceColumns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "number",
      header: "Invoice #",
      cell: ({ row }) => (
        <span className="font-semibold text-primary hover:underline cursor-pointer">
          {row.original.number}
        </span>
      ),
    },
    {
      accessorKey: "invoiceDate",
      header: "Invoice Date",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatDate(row.original.invoiceDate)}</span>
      ),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatDate(row.original.dueDate)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <StatusBadge status={row.original.status} />
          {row.original.isOverdue && <StatusBadge status="overdue" />}
        </div>
      ),
    },
    {
      accessorKey: "total",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground">
          {formatCurrency(row.original.total)}
        </span>
      ),
    },
    {
      accessorKey: "balance",
      header: "Balance Due",
      cell: ({ row }) => (
        <span
          className={`font-bold ${
            row.original.balance > 0 ? "text-rose-600" : "text-emerald-600"
          }`}
        >
          {formatCurrency(row.original.balance)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/invoices/${row.original.id}`)}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
            title="View Invoice"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigate(`/invoices/${row.original.id}?print=true`)}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
            title="Print Invoice"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const invSummaryChips = [
    { label: "All Invoices", status: "all", overdue: false },
    { label: "Confirmed", status: "confirmed", overdue: false },
    { label: "Paid", status: "paid", overdue: false },
    { label: "Overdue", status: "all", overdue: true },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div className="border-b border-border pb-4 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <span>Welcome, {user?.name || "Customer"}!</span>
          <Sparkles className="w-5 h-5 text-primary" />
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Self-service portal for reviewing active contracts, billing schedules and tax receipts.
        </p>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. Active Subscriptions Card */}
        <div
          onClick={() => updateParams({ tab: "subscriptions", subStatus: "active", subPage: 1 })}
          className="p-5 bg-card border border-border rounded-xl shadow-sm hover:border-primary/50 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Subscriptions
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          {isSummaryLoading ? (
            <div className="h-7 bg-muted animate-pulse rounded w-1/3" />
          ) : isSummaryError ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                refetchSummary();
              }}
              className="text-xs text-rose-600 font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          ) : (
            <div>
              <p className="text-2xl font-black text-foreground">
                {summary?.activeSubscriptions ?? 0}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Active recurring plans
              </p>
            </div>
          )}
        </div>

        {/* 2. Outstanding Balance Card */}
        <div
          onClick={() => updateParams({ tab: "invoices", invStatus: "confirmed", invPage: 1 })}
          className="p-5 bg-card border border-border rounded-xl shadow-sm hover:border-primary/50 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Outstanding Balance
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          {isSummaryLoading ? (
            <div className="h-7 bg-muted animate-pulse rounded w-1/2" />
          ) : isSummaryError ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                refetchSummary();
              }}
              className="text-xs text-rose-600 font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          ) : (
            <div>
              <p
                className={`text-2xl font-black ${
                  (summary?.outstandingAmount || 0) > 0 ? "text-rose-600" : "text-emerald-600"
                }`}
              >
                {formatCurrency(summary?.outstandingAmount ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {summary?.overdueCount && summary.overdueCount > 0 ? (
                  <span className="text-rose-600 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {summary.overdueCount} overdue invoice{summary.overdueCount > 1 ? "s" : ""}
                  </span>
                ) : (
                  "All accounts in good standing"
                )}
              </p>
            </div>
          )}
        </div>

        {/* 3. Next Invoice Card */}
        <div className="p-5 bg-card border border-border rounded-xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Next Invoice
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          {isSummaryLoading ? (
            <div className="h-7 bg-muted animate-pulse rounded w-1/2" />
          ) : isSummaryError ? (
            <button
              onClick={() => refetchSummary()}
              className="text-xs text-rose-600 font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          ) : summary?.nextInvoiceDate ? (
            <div>
              <p className="text-2xl font-black text-foreground">
                {formatDate(summary.nextInvoiceDate)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Est: {formatCurrency(summary.nextInvoiceAmount)}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-muted-foreground">
                No upcoming invoice
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                On subscription renewal
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-border text-sm font-semibold">
        <button
          onClick={() => updateParams({ tab: "subscriptions" })}
          className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-2 ${
            currentTab === "subscriptions"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>My Subscriptions ({subsData?.total || 0})</span>
        </button>

        <button
          onClick={() => updateParams({ tab: "invoices" })}
          className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-2 ${
            currentTab === "invoices"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>My Invoices ({invoicesData?.total || 0})</span>
        </button>
      </div>

      {/* Tab 1: My Subscriptions */}
      {currentTab === "subscriptions" && (
        <div className="space-y-4">
          <FilterBar
            search={subSearch}
            onSearchChange={(val) => updateParams({ subSearch: val, subPage: 1 })}
            searchPlaceholder="Search subscription number..."
            filters={[
              {
                key: "subStatus",
                label: "Status",
                value: subStatus,
                options: [
                  { label: "All Statuses", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "Quotation", value: "quotation" },
                  { label: "Confirmed", value: "confirmed" },
                  { label: "Closed", value: "closed" },
                ],
                onChange: (val) => updateParams({ subStatus: val, subPage: 1 }),
              },
            ]}
          />

          {!isSubsLoading && (!subsData || subsData.data.length === 0) ? (
            <EmptyState
              title="No subscriptions found"
              description="You don't have any subscriptions yet. Contact us or request a quote to get started."
              icon={<FolderOpen className="w-6 h-6" />}
            />
          ) : (
            <DataTable
              columns={subColumns}
              data={subsData?.data || []}
              total={subsData?.total || 0}
              isLoading={isSubsLoading}
              pagination={{ page: subPage, pageSize: subPageSize }}
              onPaginationChange={(p: PaginationState) =>
                updateParams({ subPage: p.page, subPageSize: p.pageSize })
              }
              onRowClick={(row) => navigate(`/subscriptions/${row.id}`)}
              emptyMessage="You don't have any subscriptions yet."
            />
          )}
        </div>
      )}

      {/* Tab 2: My Invoices */}
      {currentTab === "invoices" && (
        <div className="space-y-4">
          {/* Status Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {invSummaryChips.map((chip, idx) => {
              const isActive =
                chip.overdue
                  ? invOverdue
                  : !invOverdue && invStatus === chip.status;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    updateParams({
                      invStatus: chip.status,
                      invOverdue: chip.overdue ? "true" : null,
                      invPage: 1,
                    })
                  }
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    isActive
                      ? chip.overdue
                        ? "bg-rose-100 text-rose-800 border-rose-300 ring-2 ring-rose-300/40"
                        : "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Filter Bar with date range */}
          <FilterBar
            search={invSearch}
            onSearchChange={(val) => updateParams({ invSearch: val, invPage: 1 })}
            searchPlaceholder="Search invoice #..."
          />

          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span className="font-medium text-foreground flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Date Range:
            </span>
            <input
              type="date"
              value={invDateFrom}
              onChange={(e) => updateParams({ invDateFrom: e.target.value, invPage: 1 })}
              placeholder="From"
              className="px-2 py-1 bg-card border border-border rounded text-foreground text-xs"
            />
            <span>to</span>
            <input
              type="date"
              value={invDateTo}
              onChange={(e) => updateParams({ invDateTo: e.target.value, invPage: 1 })}
              placeholder="To"
              className="px-2 py-1 bg-card border border-border rounded text-foreground text-xs"
            />
            {(invDateFrom || invDateTo) && (
              <button
                type="button"
                onClick={() => updateParams({ invDateFrom: "", invDateTo: "", invPage: 1 })}
                className="text-xs text-primary hover:underline ml-1"
              >
                Clear dates
              </button>
            )}
          </div>

          {!isInvoicesLoading && (!invoicesData || invoicesData.data.length === 0) ? (
            <EmptyState
              title="No invoices found"
              description="No billing records or invoices for your account yet."
              icon={<Receipt className="w-6 h-6" />}
            />
          ) : (
            <DataTable
              columns={invoiceColumns}
              data={invoicesData?.data || []}
              total={invoicesData?.total || 0}
              isLoading={isInvoicesLoading}
              pagination={{ page: invPage, pageSize: invPageSize }}
              onPaginationChange={(p: PaginationState) =>
                updateParams({ invPage: p.page, invPageSize: p.pageSize })
              }
              onRowClick={(row) => navigate(`/invoices/${row.id}`)}
              emptyMessage="No invoices yet."
            />
          )}
        </div>
      )}
    </div>
  );
};
