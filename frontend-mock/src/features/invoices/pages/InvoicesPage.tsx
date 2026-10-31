import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { useAuthStore } from "@/store/auth.store";
import {
  useInvoices,
  useGenerateInvoices,
  useConfirmInvoice,
  useCancelInvoice,
  useSendInvoice,
} from "../api";
import { generateInvoicesSchema, type Invoice, type GenerateInvoicesInput } from "../schemas";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type PaginationState } from "@/components/shared/DataTable";
import { FormDialog } from "@/components/shared/FormDialog";
import { FilterBar } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RecordPaymentDialog } from "@/features/payments/components/RecordPaymentDialog";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  Play,
  Eye,
  CheckCircle2,
  XCircle,
  Send,
  Printer,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  CreditCard,
} from "lucide-react";

export const InvoicesPage: React.FC = () => {
  const role = useAuthStore((s) => s.role);
  const isCustomer = role === "customer";
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  // URL state persistence
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const search = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "all";
  const overdueParam = searchParams.get("overdue") === "true";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const sort = searchParams.get("sort") || "createdAt:desc";

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

  // Queries & Mutations
  const { data, isLoading } = useInvoices({
    page,
    pageSize,
    search,
    status: statusFilter === "all" ? undefined : statusFilter,
    overdue: overdueParam ? true : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    sort,
  });

  const generateMutation = useGenerateInvoices();
  const confirmMutation = useConfirmInvoice();
  const cancelMutation = useCancelInvoice();
  const sendMutation = useSendInvoice();

  const [generateOpen, setGenerateOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Invoice | null>(null);
  const [sendTarget, setSendTarget] = useState<Invoice | null>(null);
  const [recordPaymentTarget, setRecordPaymentTarget] = useState<Invoice | null>(null);

  const handleGenerateSubmit = async (values: GenerateInvoicesInput) => {
    await generateMutation.mutateAsync(values);
    setGenerateOpen(false);
  };

  const handleConfirmInvoice = async (e: React.MouseEvent, inv: Invoice) => {
    e.stopPropagation();
    await confirmMutation.mutateAsync(inv.id);
  };

  const handleExecuteCancel = async () => {
    if (!cancelTarget) return;
    await cancelMutation.mutateAsync(cancelTarget.id);
    setCancelTarget(null);
  };

  const handleExecuteSend = async () => {
    if (!sendTarget) return;
    await sendMutation.mutateAsync(sendTarget.id);
    setSendTarget(null);
  };

  const handlePrint = (e: React.MouseEvent, inv: Invoice) => {
    e.stopPropagation();
    navigate(`/invoices/${inv.id}?print=true`);
  };

  // Quick summary chips that directly set the filter
  const summaryChips = [
    { label: "All Invoices", status: "all", overdue: false },
    { label: "Draft", status: "draft", overdue: false },
    { label: "Confirmed", status: "confirmed", overdue: false },
    { label: "Paid", status: "paid", overdue: false },
    { label: "Overdue Only", status: "all", overdue: true },
  ];

  // Columns definition
  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "number",
      header: "Invoice #",
      cell: ({ row }) => (
        <span className="font-mono font-medium text-brand-verdigris hover:underline cursor-pointer">
          {row.original.number}
        </span>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-foreground">
            {row.original.customer.name}
          </div>
          {row.original.customer.email && (
            <div className="text-xs text-muted-foreground">
              {row.original.customer.email}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "subscription",
      header: "Subscription",
      cell: ({ row }) => (
        <Link
          to={`/subscriptions/${row.original.subscriptionId}`}
          onClick={(e) => e.stopPropagation()}
          className="font-mono text-xs font-medium text-ink-primary hover:text-brand-verdigris hover:underline"
        >
          {row.original.subscription.number}
        </Link>
      ),
    },
    {
      accessorKey: "invoiceDate",
      meta: { align: "right" },
      header: "Invoice Date",
      cell: ({ row }) => (
        <span className="font-mono tabular-nums text-ink-secondary">{formatDate(row.original.invoiceDate)}</span>
      ),
    },
    {
      accessorKey: "dueDate",
      meta: { align: "right" },
      header: "Due Date",
      cell: ({ row }) => (
        <span className="font-mono tabular-nums text-ink-secondary">{formatDate(row.original.dueDate)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <StatusBadge status={row.original.status} />
          {row.original.isOverdue && <StatusBadge status="overdue" />}
        </div>
      ),
    },
    {
      accessorKey: "total",
      meta: { align: "right" },
      header: "Total",
      cell: ({ row }) => (
        <span className="font-mono tabular-nums font-medium text-ink-primary">
          {formatCurrency(row.original.total)}
        </span>
      ),
    },
    {
      accessorKey: "balance",
      meta: { align: "right" },
      header: "Balance",
      cell: ({ row }) => {
        const bal = row.original.balance;
        return (
          <span
            className={`font-mono tabular-nums font-medium ${
              bal > 0 ? "text-danger-cinnabar" : "text-brand-verdigris"
            }`}
          >
            {formatCurrency(bal)}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const inv = row.original;
        const canConfirm = !isCustomer && inv.status === "draft";
        const canCancel =
          !isCustomer &&
          (inv.status === "draft" || inv.status === "confirmed") &&
          (!inv.payments || inv.payments.length === 0);
        const canSend = !isCustomer && (inv.status === "confirmed" || inv.status === "paid");

        return (
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            {/* View */}
            <button
              onClick={() => navigate(`/invoices/${inv.id}`)}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
              title="View Invoice"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {/* Record Payment (only for confirmed invoices with balance > 0) */}
            {!isCustomer && inv.status === "confirmed" && inv.balance > 0 && (
              <button
                onClick={() => setRecordPaymentTarget(inv)}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                title="Record Payment"
              >
                <CreditCard className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Confirm */}
            {canConfirm && (
              <button
                onClick={(e) => handleConfirmInvoice(e, inv)}
                disabled={confirmMutation.isPending}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Confirm Draft Invoice"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Send */}
            {canSend && (
              <button
                onClick={() => setSendTarget(inv)}
                className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                title="Send Invoice to Customer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Cancel */}
            {canCancel && (
              <button
                onClick={() => setCancelTarget(inv)}
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                title="Cancel Invoice"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Print */}
            <button
              onClick={(e) => handlePrint(e, inv)}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
              title="Print Invoice"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Invoices & Recurring Billing"
        description="Monitor automated billing runs, confirm invoices, and track outstanding balances."
        actions={
          !isCustomer ? (
            <button
              onClick={() => setGenerateOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary text-primary-foreground text-xs sm:text-sm font-semibold rounded-lg hover:opacity-95 transition-opacity shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Invoices</span>
            </button>
          ) : undefined
        }
      />

      {/* Quick Summary Filter Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {summaryChips.map((chip, idx) => {
          const isActive =
            chip.overdue
              ? overdueParam
              : !overdueParam && statusFilter === chip.status;

          return (
            <button
              key={idx}
              type="button"
              onClick={() =>
                updateParams({
                  status: chip.status,
                  overdue: chip.overdue ? "true" : null,
                  page: 1,
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
        search={search}
        onSearchChange={(val) => updateParams({ search: val, page: 1 })}
        searchPlaceholder="Search invoice #, customer name, or subscription #..."
        filters={[
          {
            key: "status",
            label: "Status",
            value: statusFilter,
            options: [
              { label: "All Statuses", value: "all" },
              { label: "Draft", value: "draft" },
              { label: "Confirmed", value: "confirmed" },
              { label: "Paid", value: "paid" },
              { label: "Cancelled", value: "cancelled" },
            ],
            onChange: (val) => updateParams({ status: val, page: 1 }),
          },
        ]}
      />

      {/* Date Range Inputs */}
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

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        total={data?.total || 0}
        isLoading={isLoading}
        pagination={{ page, pageSize }}
        onPaginationChange={(p: PaginationState) =>
          updateParams({ page: p.page, pageSize: p.pageSize })
        }
        onRowClick={(row) => navigate(`/invoices/${row.id}`)}
        emptyMessage="No invoices found matching current criteria."
      />

      {/* Generate Invoices Modal */}
      <FormDialog<GenerateInvoicesInput>
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        title="Automated Billing: Generate Invoices"
        description="Run batch billing generation across all active subscriptions due on or before the selected date. Subscriptions already billed for the period will be automatically skipped."
        schema={generateInvoicesSchema}
        defaultValues={{
          asOfDate: new Date().toISOString().split("T")[0],
        }}
        onSubmit={handleGenerateSubmit}
        isLoading={generateMutation.isPending}
        submitLabel="Run Billing Generator"
      >
        {(form) => (
          <div className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                As of Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                {...form.register("asOfDate")}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              />
              {form.formState.errors.asOfDate && (
                <p className="text-xs text-rose-500 font-medium">
                  {form.formState.errors.asOfDate.message}
                </p>
              )}
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-primary">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Idempotent Billing Safe</span>
              </div>
              <p>
                Nothing will be billed twice. Running this batch repeatedly for the same date will safely skip subscriptions that already have an invoice.
              </p>
            </div>
          </div>
        )}
      </FormDialog>

      {/* Cancel Invoice Confirmation Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-xl p-5 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Cancel Invoice?
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Are you sure you want to cancel{" "}
                <strong className="text-foreground">{cancelTarget.number}</strong>?
                This action is irreversible.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-muted"
              >
                No, Keep
              </button>
              <button
                type="button"
                disabled={cancelMutation.isPending}
                onClick={handleExecuteCancel}
                className="px-3.5 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50"
              >
                {cancelMutation.isPending ? "Cancelling..." : "Cancel Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Invoice Modal */}
      {sendTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-xl p-5 space-y-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Send Invoice Email?
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Send electronic invoice notification for{" "}
                <strong className="text-foreground">{sendTarget.number}</strong> to{" "}
                <strong className="text-foreground">
                  {sendTarget.customer.email || sendTarget.customer.name}
                </strong>
                .
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setSendTarget(null)}
                className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sendMutation.isPending}
                onClick={handleExecuteSend}
                className="px-3.5 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-95 disabled:opacity-50"
              >
                {sendMutation.isPending ? "Sending..." : "Send Now"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Record Payment Dialog */}
      <RecordPaymentDialog
        invoice={recordPaymentTarget}
        open={Boolean(recordPaymentTarget)}
        onOpenChange={(open) => !open && setRecordPaymentTarget(null)}
      />
    </div>
  );
};

