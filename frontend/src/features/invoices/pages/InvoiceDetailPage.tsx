import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import {
  useInvoice,
  useConfirmInvoice,
  useCancelInvoice,
  useSendInvoice,
} from "../api";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RecordPaymentDialog } from "@/features/payments/components/RecordPaymentDialog";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Send,
  Printer,
  Sparkles,
  CreditCard,
  Building2,
  Calendar,
  Layers,
  FileCheck2,
  AlertCircle,
  Lock,
} from "lucide-react";

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = useAuthStore((s) => s.role);
  const isCustomer = role === "customer";

  const { data: inv, isLoading, error } = useInvoice(id);

  const confirmMutation = useConfirmInvoice();
  const cancelMutation = useCancelInvoice();
  const sendMutation = useSendInvoice();

  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);

  // Auto-trigger window.print if ?print=true is present
  useEffect(() => {
    if (inv && searchParams.get("print") === "true") {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [inv, searchParams]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-64 bg-card border border-border rounded-xl" />
      </div>
    );
  }

  if (error || !inv) {
    return (
      <div className="space-y-4">
        <Link
          to={isCustomer ? "/portal?tab=invoices" : "/invoices"}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isCustomer ? "Back to Portal" : "Back to Invoices"}</span>
        </Link>
        <div className="p-8 bg-card border border-border rounded-xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-base font-semibold text-foreground">
            Invoice Not Found
          </h3>
          <p className="text-xs text-muted-foreground">
            The requested invoice does not exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  const canConfirm = !isCustomer && inv.status === "draft";
  const canCancel =
    !isCustomer &&
    (inv.status === "draft" || inv.status === "confirmed") &&
    (!inv.payments || inv.payments.length === 0);
  const canSend = !isCustomer && (inv.status === "confirmed" || inv.status === "paid");

  const handleConfirm = async () => {
    await confirmMutation.mutateAsync(inv.id);
  };

  const handleExecuteSend = async () => {
    await sendMutation.mutateAsync(inv.id);
    setSendConfirmOpen(false);
  };

  const handleExecuteCancel = async () => {
    await cancelMutation.mutateAsync(inv.id);
    setCancelConfirmOpen(false);
  };

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Top Navigation & Action Bar (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <Link
          to={isCustomer ? "/portal?tab=invoices" : "/invoices"}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isCustomer ? "My Invoices" : "All Invoices"}</span>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Print */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border bg-card hover:bg-muted rounded-lg text-foreground transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Print Invoice</span>
          </button>

          {/* Confirm */}
          {canConfirm && (
            <button
              onClick={handleConfirm}
              disabled={confirmMutation.isPending}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground text-xs sm:text-sm font-semibold rounded-lg hover:opacity-95 transition-opacity disabled:opacity-50 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Invoice</span>
            </button>
          )}

          {/* Send */}
          {canSend && (
            <button
              onClick={() => setSendConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-primary/20 bg-primary/10 hover:bg-primary/20 rounded-lg text-primary transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Invoice</span>
            </button>
          )}

          {/* Cancel */}
          {canCancel && (
            <button
              onClick={() => setCancelConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-rose-200 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-700 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Invoice</span>
            </button>
          )}

          {/* Record Payment Button */}
          {!isCustomer && inv.status === "confirmed" && inv.balance > 0 && (
            <button
              onClick={() => setRecordPaymentOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Invoice Card (Print Clean Sheet) */}
      <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Printable Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                BL
              </div>
              <span className="font-extrabold text-lg tracking-tight text-foreground">
                Brightloop Software Pvt Ltd
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Tax Invoice & Recurring Subscription Settlement
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="flex items-center sm:justify-end gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-foreground">
                {inv.number}
              </h1>
              <StatusBadge status={inv.status} />
              {inv.isOverdue && <StatusBadge status="overdue" />}
            </div>
            <p className="text-xs text-muted-foreground">
              Date: <strong className="text-foreground">{formatDate(inv.invoiceDate)}</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              Due Date: <strong className="text-foreground">{formatDate(inv.dueDate)}</strong>
            </p>
          </div>
        </div>

        {/* Customer & Subscription Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs border-b border-border pb-6">
          {/* Bill To */}
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider text-muted-foreground">
              Billed To
            </span>
            <p className="text-sm font-bold text-foreground">
              {inv.customer.name}
            </p>
            {inv.customer.company && (
              <p className="text-muted-foreground">{inv.customer.company}</p>
            )}
            {inv.customer.email && (
              <p className="text-muted-foreground">{inv.customer.email}</p>
            )}
          </div>

          {/* Linked Subscription */}
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider text-muted-foreground">
              Linked Subscription
            </span>
            <p className="text-sm font-semibold text-foreground">
              <Link
                to={`/subscriptions/${inv.subscriptionId}`}
                className="text-primary hover:underline"
              >
                {inv.subscription.number}
              </Link>
            </p>
            <p className="text-muted-foreground">
              Period: {formatDate(inv.periodStart)} → {formatDate(inv.periodEnd)}
            </p>
          </div>

          {/* Payment Terms & Summary */}
          <div className="space-y-1 sm:text-right">
            <span className="font-bold uppercase tracking-wider text-muted-foreground">
              Payment Status
            </span>
            <p className="text-sm font-bold text-foreground">
              Balance:{" "}
              <span className={inv.balance > 0 ? "text-rose-600" : "text-emerald-600"}>
                {formatCurrency(inv.balance)}
              </span>
            </p>
            <p className="text-muted-foreground">
              Amount Paid: {formatCurrency(inv.amountPaid)}
            </p>
          </div>
        </div>

        {/* Invoice Line Items */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Tax</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {inv.lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-muted/20">
                  <td className="py-3 px-3 font-semibold text-foreground">
                    {line.description}
                  </td>
                  <td className="py-3 px-3 text-center font-medium">
                    {line.quantity}
                  </td>
                  <td className="py-3 px-3 text-right font-medium">
                    {formatCurrency(line.unitPrice)}
                  </td>
                  <td className="py-3 px-3 text-right text-muted-foreground">
                    {formatCurrency(line.taxAmount)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-foreground">
                    {formatCurrency(line.amount)}
                  </td>
                </tr>
              ))}

              {/* Show discount as separate line row if discountTotal > 0 */}
              {inv.discountTotal > 0 && (
                <tr className="bg-emerald-50/50 text-emerald-800">
                  <td colSpan={4} className="py-2.5 px-3 font-semibold">
                    Promotional & Volume Discount
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold">
                    -{formatCurrency(inv.discountTotal)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-end pt-4 border-t border-border">
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(inv.subtotal)}
              </span>
            </div>
            {inv.discountTotal > 0 && (
              <div className="flex items-center justify-between text-emerald-600">
                <span>Total Discount:</span>
                <span className="font-semibold">
                  -{formatCurrency(inv.discountTotal)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Total Tax:</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(inv.taxTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border text-sm font-bold text-foreground">
              <span>Total:</span>
              <span className="text-foreground">{formatCurrency(inv.total)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Amount Paid:</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(inv.amountPaid)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-dashed border-border text-sm font-extrabold">
              <span className="text-foreground">Balance Due:</span>
              <span className={inv.balance > 0 ? "text-rose-600" : "text-emerald-600"}>
                {formatCurrency(inv.balance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Real Payments Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Payments & Settlements
            </h4>
          </div>

          {/* Payment Status Indicator Line */}
          <div>
            {inv.status === "paid" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Paid in full
              </span>
            ) : inv.amountPaid > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                Partially paid: {formatCurrency(inv.amountPaid)} of {formatCurrency(inv.total)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">
                Unpaid
              </span>
            )}
          </div>
        </div>

        {/* Payments Table */}
        {!inv.payments || inv.payments.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
            No payments have been recorded for this invoice yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 uppercase font-semibold text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Payment Method</th>
                  <th className="py-2.5 px-3">Reference / Note</th>
                  <th className="py-2.5 px-3 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inv.payments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20">
                    <td className="py-2.5 px-3 font-medium text-foreground">
                      {formatDate(p.date)}
                    </td>
                    <td className="py-2.5 px-3 capitalize text-muted-foreground">
                      {p.method.replace("_", " ")}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {p.note || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                      {formatCurrency(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-border font-bold">
                <tr>
                  <td colSpan={3} className="py-2.5 px-3 text-right text-muted-foreground">
                    Total Paid:
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-600">
                    {formatCurrency(inv.amountPaid)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="py-1 px-3 text-right text-muted-foreground">
                    Remaining Balance:
                  </td>
                  <td
                    className={`py-1 px-3 text-right ${
                      inv.balance > 0 ? "text-rose-600" : "text-emerald-600"
                    }`}
                  >
                    {formatCurrency(inv.balance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Dialog */}
      <RecordPaymentDialog
        invoice={inv}
        open={recordPaymentOpen}
        onOpenChange={setRecordPaymentOpen}
      />

      {/* Send Confirmation Dialog */}
      {sendConfirmOpen && (
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
                Dispatch an electronic invoice to{" "}
                <strong className="text-foreground">
                  {inv.customer.email || inv.customer.name}
                </strong>
                ?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setSendConfirmOpen(false)}
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

      {/* Cancel Confirmation Dialog */}
      {cancelConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-xl p-5 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Cancel Invoice?
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Are you sure you want to cancel{" "}
                <strong className="text-foreground">{inv.number}</strong>? This action cannot be reversed.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setCancelConfirmOpen(false)}
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
    </div>
  );
};

