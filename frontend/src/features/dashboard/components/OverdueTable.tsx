import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/DataTable";
import type { OverdueInvoiceItem } from "../schemas";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { AlertCircle, ArrowRight, RefreshCw } from "lucide-react";

interface OverdueTableProps {
  data?: OverdueInvoiceItem[];
  total?: number;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  page: number;
  pageSize: number;
  onPaginationChange: (pagination: { page: number; pageSize: number }) => void;
}

export const OverdueTable: React.FC<OverdueTableProps> = ({
  data = [],
  total = 0,
  isLoading,
  isError,
  onRetry,
  page,
  pageSize,
  onPaginationChange,
}) => {
  const navigate = useNavigate();

  const columns: ColumnDef<OverdueInvoiceItem>[] = [
    {
      accessorKey: "number",
      header: "Invoice #",
      cell: ({ row }) => (
        <span
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/invoices/${row.original.id}`);
          }}
          className="font-semibold text-primary hover:underline cursor-pointer"
        >
          {row.original.number}
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
      accessorKey: "balance",
      header: "Balance Due",
      cell: ({ row }) => (
        <span className="font-bold text-rose-600">
          {formatCurrency(row.original.balance)}
        </span>
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
      accessorKey: "daysOverdue",
      header: "Days Overdue",
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-700 border border-rose-300">
          {row.original.daysOverdue} days
        </span>
      ),
    },
  ];

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-5 space-y-4">
      {/* Header with "View all" deep link */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Overdue Invoices
            </h3>
            <p className="text-xs text-muted-foreground">
              Unsettled contracts past payment terms
            </p>
          </div>
        </div>

        <Link
          to="/invoices?overdue=true"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <span>View all overdue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isError ? (
        <div className="p-6 text-center space-y-2">
          <p className="text-xs text-rose-600 font-medium">
            Failed to load overdue invoices
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded hover:bg-rose-100"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          total={total}
          isLoading={isLoading}
          pagination={{ page, pageSize }}
          onPaginationChange={onPaginationChange}
          onRowClick={(row) => navigate(`/invoices/${row.id}`)}
          emptyMessage="No overdue invoices! All due accounts are settled."
        />
      )}
    </div>
  );
};

