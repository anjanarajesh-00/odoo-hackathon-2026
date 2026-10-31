import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { usePayments } from "../api";
import type { Payment } from "../schemas";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type PaginationState } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/types/enums";
import { CreditCard, Calendar, Receipt, FileText } from "lucide-react";

export const PaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL State persistence
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const search = searchParams.get("search") || "";
  const method = searchParams.get("method") || "all";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const sort = searchParams.get("sort") || "createdAt:desc";

  const updateParams = (updates: Record<string, string | number | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === "" || v === "all" || v === null) {
        next.delete(k);
      } else {
        next.set(k, String(v));
      }
    });
    setSearchParams(next, { replace: true });
  };

  const { data, isLoading } = usePayments({
    page,
    pageSize,
    search,
    method: method === "all" ? undefined : method,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    sort,
  });

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "date",
      meta: { align: "right" },
      header: "Payment Date",
      cell: ({ row }) => (
        <span className="font-mono tabular-nums text-ink-secondary">
          {formatDate(row.original.date)}
        </span>
      ),
    },
    {
      accessorKey: "invoice",
      header: "Invoice #",
      cell: ({ row }) => (
        <span
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/invoices/${row.original.invoiceId}`);
          }}
          className="font-mono font-medium text-brand-verdigris hover:underline cursor-pointer"
        >
          {row.original.invoice.number}
        </span>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground">
          {row.original.customer.name}
        </span>
      ),
    },
    {
      accessorKey: "method",
      header: "Method",
      cell: ({ row }) => {
        const m = row.original.method as PaymentMethod;
        const label = PAYMENT_METHOD_LABELS[m] || m;
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-muted text-foreground border border-border capitalize">
            {label}
          </span>
        );
      },
    },
    {
      accessorKey: "amount",
      meta: { align: "right" },
      header: "Amount Paid",
      cell: ({ row }) => (
        <span className="font-mono tabular-nums font-medium text-brand-verdigris">
          {formatCurrency(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: "note",
      header: "Transaction Reference / Note",
      cell: ({ row }) => (
        <span
          className="text-xs text-muted-foreground truncate max-w-xs block"
          title={row.original.note}
        >
          {row.original.note || "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Payment Transactions"
        description="Audit logged cash, card, bank transfer and UPI receipts reconciled with invoices."
      />

      {/* Filtered Total Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-card border border-border rounded-container">
        <div>
          <span className="text-xs font-medium text-ink-secondary">
            Total Payments Recorded
          </span>
          <p className="text-xl font-mono tabular-nums font-medium text-ink-primary">
            {data?.total || 0}
          </p>
        </div>

        <div>
          <span className="text-xs font-medium text-ink-secondary">
            Filtered Collection Volume
          </span>
          <p className="text-xl font-mono tabular-nums font-medium text-brand-verdigris">
            {data?.totalAmount !== undefined ? formatCurrency(data.totalAmount) : "—"}
          </p>
        </div>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={(val) => updateParams({ search: val, page: 1 })}
        searchPlaceholder="Search by invoice number, customer name, or note..."
        filters={[
          {
            key: "method",
            label: "Payment Method",
            value: method,
            options: [
              { label: "All Methods", value: "all" },
              { label: "Bank Transfer", value: "bank_transfer" },
              { label: "UPI", value: "upi" },
              { label: "Credit / Debit Card", value: "card" },
              { label: "Cash", value: "cash" },
              { label: "Cheque", value: "cheque" },
            ],
            onChange: (val) => updateParams({ method: val, page: 1 }),
          },
        ]}
      />

      {/* Date Range Filters */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
        <span className="font-medium text-foreground flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" /> Date Range:
        </span>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => updateParams({ dateFrom: e.target.value, page: 1 })}
          placeholder="From"
          className="px-2 py-1 bg-card border border-border rounded text-foreground text-xs"
        />
        <span>to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => updateParams({ dateTo: e.target.value, page: 1 })}
          placeholder="To"
          className="px-2 py-1 bg-card border border-border rounded text-foreground text-xs"
        />
        {(dateFrom || dateTo) && (
          <button
            type="button"
            onClick={() => updateParams({ dateFrom: "", dateTo: "", page: 1 })}
            className="text-xs text-primary hover:underline ml-1"
          >
            Clear dates
          </button>
        )}
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        total={data?.total || 0}
        isLoading={isLoading}
        pagination={{ page, pageSize }}
        onPaginationChange={(p: PaginationState) =>
          updateParams({ page: p.page, pageSize: p.pageSize })
        }
        onRowClick={(row) => navigate(`/invoices/${row.invoiceId}`)}
        emptyMessage="No payments found matching criteria."
      />
    </div>
  );
};

