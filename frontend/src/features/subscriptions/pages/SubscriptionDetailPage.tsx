import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import {
  useSubscription,
  useSubscriptionHistory,
  useTransitionSubscription,
  useRenewSubscription,
  useUpdateSubscription,
  useCustomersLookup,
  useTaxes,
  useQuotationTemplates,
} from "../api";
import { useInvoices } from "@/features/invoices/api";
import { usePlans } from "@/features/plans/api";
import { useProducts } from "@/features/products/api";
import {
  subscriptionFormSchema,
  type SubscriptionFormInput,
} from "../schemas";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { FormDialog } from "@/components/shared/FormDialog";
import { SubscriptionStepper } from "../components/SubscriptionStepper";
import { SubscriptionFormFields } from "../components/SubscriptionFormFields";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatters";
import type { SubscriptionStatus } from "@/types/enums";
import {
  ArrowLeft,
  Edit2,
  Send,
  CheckCircle2,
  PlayCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  History,
  FileText,
  Clock,
  Layers,
  Calendar,
  Building2,
  Receipt,
} from "lucide-react";

export const SubscriptionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const isAdmin = role === "admin";
  const isCustomer = role === "customer";

  const { data: sub, isLoading, error } = useSubscription(id);
  const { data: history = [] } = useSubscriptionHistory(id);
  const { data: subInvoicesData, isLoading: isInvoicesLoading } = useInvoices({
    subscriptionId: id,
    pageSize: 20,
  });

  const { data: customers } = useCustomersLookup();
  const { data: plansData } = usePlans({ pageSize: 100 });
  const { data: productsData } = useProducts({ pageSize: 100 });
  const { data: taxes } = useTaxes();
  const { data: templates } = useQuotationTemplates();

  const transitionMutation = useTransitionSubscription();
  const renewMutation = useRenewSubscription();
  const updateMutation = useUpdateSubscription();

  const [editOpen, setEditOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [renewConfirmOpen, setRenewConfirmOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-64 bg-card border border-border rounded-xl" />
      </div>
    );
  }

  if (error || !sub) {
    return (
      <div className="space-y-4">
        <Link
          to={isCustomer ? "/portal?tab=subscriptions" : "/subscriptions"}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isCustomer ? "Back to Portal" : "Back to Subscriptions"}</span>
        </Link>
        <div className="p-8 bg-card border border-border rounded-xl text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-base font-semibold text-foreground">
            Subscription Not Found
          </h3>
          <p className="text-xs text-muted-foreground">
            The subscription requested could not be located or has been archived.
          </p>
        </div>
      </div>
    );
  }

  // Quotation expiry check
  const quoteExpiry = sub.quotationValidUntil ? new Date(sub.quotationValidUntil).getTime() : null;
  const now = Date.now();
  const quoteDaysLeft = quoteExpiry ? Math.ceil((quoteExpiry - now) / 86400000) : null;
  const isQuoteExpiringSoon = sub.status === "quotation" && quoteDaysLeft !== null && quoteDaysLeft <= 3 && quoteDaysLeft >= 0;
  const isQuoteExpired = sub.status === "quotation" && quoteDaysLeft !== null && quoteDaysLeft < 0;

  // Next transition logic
  const getNextAction = (): { label: string; to: SubscriptionStatus; icon: React.ReactNode } | null => {
    if (sub.status === "draft") {
      return { label: "Send Quotation", to: "quotation", icon: <Send className="w-4 h-4" /> };
    }
    if (sub.status === "quotation") {
      return { label: "Confirm Quote", to: "confirmed", icon: <CheckCircle2 className="w-4 h-4" /> };
    }
    if (sub.status === "confirmed") {
      return { label: "Activate Subscription", to: "active", icon: <PlayCircle className="w-4 h-4" /> };
    }
    return null;
  };

  const nextAction = getNextAction();

  const handleExecuteTransition = async (to: SubscriptionStatus) => {
    await transitionMutation.mutateAsync({ id: sub.id, to });
  };

  const handleEditSubmit = async (values: SubscriptionFormInput) => {
    await updateMutation.mutateAsync({ id: sub.id, data: values });
    setEditOpen(false);
  };

  const handleExecuteRenew = async () => {
    await renewMutation.mutateAsync(sub.id);
    setRenewConfirmOpen(false);
  };

  const canEdit = !isCustomer && (sub.status === "draft" || sub.status === "quotation");
  const canClose = isAdmin && (sub.status === "confirmed" || sub.status === "active");
  const canRenew = isAdmin && sub.status === "active";

  return (
    <div className="space-y-6">
      {/* Top back navigation and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to={isCustomer ? "/portal?tab=subscriptions" : "/subscriptions"}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isCustomer ? "My Subscriptions" : "All Subscriptions"}</span>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {canEdit && (
            <button
              onClick={() => setEditOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border bg-card hover:bg-muted rounded-lg text-foreground transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Edit</span>
            </button>
          )}

          {canRenew && (
            <button
              onClick={() => setRenewConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border bg-card hover:bg-muted rounded-lg text-primary transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Renew Subscription</span>
            </button>
          )}

          {canClose && (
            <button
              onClick={() => setCloseConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-rose-200 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-700 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Close Subscription</span>
            </button>
          )}

          {/* Primary Step-forward Transition Action */}
          {!isCustomer && nextAction && (
            <button
              onClick={() => handleExecuteTransition(nextAction.to)}
              disabled={transitionMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground text-xs sm:text-sm font-semibold rounded-lg hover:opacity-95 transition-opacity disabled:opacity-50 shadow-sm"
            >
              {nextAction.icon}
              <span>{nextAction.label}</span>
            </button>
          )}
        </div>
      </div>

      {/* Header Overview Card */}
      <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {sub.number}
              </h1>
              <StatusBadge status={sub.status} />

              {/* Quote Expiry Warnings */}
              {isQuoteExpired && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-300">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Quotation Expired
                </span>
              )}
              {isQuoteExpiringSoon && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  <Clock className="w-3.5 h-3.5" />
                  Expires in {quoteDaysLeft} days
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Created on {formatDate(sub.createdAt)}
            </p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
              Total Contract Amount
            </p>
            <p className="text-2xl font-black text-primary">
              {formatCurrency(sub.total)}
            </p>
          </div>
        </div>

        {/* Status Stepper */}
        <div className="pt-2">
          <SubscriptionStepper currentStatus={sub.status} />
        </div>

        {/* 4 Metadata Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border text-xs">
          {/* Customer info */}
          <div className="space-y-1">
            <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Customer
            </span>
            <p className="text-sm font-bold text-foreground">
              {sub.customer.name}
            </p>
            {sub.customer.email && (
              <p className="text-muted-foreground">{sub.customer.email}</p>
            )}
          </div>

          {/* Plan info */}
          <div className="space-y-1">
            <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Plan Tier
            </span>
            <p className="text-sm font-bold text-foreground">{sub.plan.name}</p>
            <p className="text-muted-foreground capitalize">
              {sub.plan.billingPeriod} billing interval
            </p>
          </div>

          {/* Dates */}
          <div className="space-y-1">
            <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Dates & Terms
            </span>
            <p className="text-foreground">
              <span className="text-muted-foreground">Start:</span>{" "}
              <strong>{formatDate(sub.startDate)}</strong>
            </p>
            <p className="text-foreground">
              <span className="text-muted-foreground">Expires:</span>{" "}
              <strong>{formatDate(sub.expiryDate)}</strong>
            </p>
            <p className="text-muted-foreground">Terms: {sub.paymentTerms}</p>
          </div>

          {/* Billing Cycle / Next Invoice */}
          <div className="space-y-1">
            <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5" /> Next Invoice Date
            </span>
            <p className="text-sm font-bold text-foreground">
              {sub.nextInvoiceDate ? formatDate(sub.nextInvoiceDate) : "On confirmation"}
            </p>
            {sub.quotationValidUntil && (
              <p className="text-muted-foreground">
                Quote valid until: {formatDate(sub.quotationValidUntil)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Product Lines Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden space-y-4 p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
          Contract Order Lines
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Variant</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3">Taxes</th>
                <th className="py-2.5 px-3 text-right">Discount</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sub.lines.map((line) => (
                <tr key={line.id} className="hover:bg-muted/20">
                  <td className="py-3 px-3 font-semibold text-foreground">
                    {line.product.name}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">
                    {line.variant?.value ? line.variant.value : "—"}
                  </td>
                  <td className="py-3 px-3 text-center font-medium">
                    {line.quantity}
                  </td>
                  <td className="py-3 px-3 text-right font-medium">
                    {formatCurrency(line.unitPrice)}
                  </td>
                  <td className="py-3 px-3">
                    {line.taxes && line.taxes.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {line.taxes.map((t) => (
                          <span
                            key={t.id}
                            className="inline-block px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground"
                          >
                            {t.name} ({formatCurrency(t.amount)})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right text-muted-foreground">
                    {line.discountAmount ? formatCurrency(line.discountAmount) : "₹0.00"}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-foreground">
                    {formatCurrency(line.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary Block */}
        <div className="flex justify-end pt-4 border-t border-border">
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(sub.subtotal)}
              </span>
            </div>
            {sub.discountTotal > 0 && (
              <div className="flex items-center justify-between text-emerald-600">
                <span>Total Discount:</span>
                <span className="font-semibold">
                  -{formatCurrency(sub.discountTotal)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Total Tax:</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(sub.taxTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border text-sm font-bold text-foreground">
              <span>Grand Total:</span>
              <span className="text-primary text-base">
                {formatCurrency(sub.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lifecycle Transition History (Staff/Admin only) */}
      {!isCustomer && (
        <div className="bg-card border border-border rounded-xl shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Audit Trail & Status History
            </h3>
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No status transition logs recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 text-xs p-3 rounded-lg bg-muted/30 border border-border"
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="font-semibold text-foreground">
                        Transition to{" "}
                        <span className="uppercase text-primary">{item.to}</span>
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        {formatDateTime(item.at)}
                      </span>
                    </div>
                    {item.note && (
                      <p className="text-muted-foreground text-xs">{item.note}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground/75">
                      Action performed by: {item.by}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invoices Table for this Subscription */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Billing Cycles & Invoices ({subInvoicesData?.total || 0})
            </h3>
          </div>
          <Link
            to={isCustomer ? "/portal?tab=invoices" : `/invoices?search=${sub.number}`}
            className="text-xs text-primary font-semibold hover:underline"
          >
            {isCustomer ? "View all invoices →" : "View all in billing →"}
          </Link>
        </div>

        {isInvoicesLoading ? (
          <div className="h-24 bg-muted animate-pulse rounded-lg" />
        ) : !subInvoicesData || subInvoicesData.data.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
            No invoices generated for this subscription yet. Invoices are created automatically on scheduled billing runs.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 uppercase font-semibold text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Period</th>
                  <th className="py-2.5 px-3">Invoice Date</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subInvoicesData.data.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-semibold text-primary hover:underline">
                      {inv.number}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {formatDate(inv.periodStart)} → {formatDate(inv.periodEnd)}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {formatDate(inv.invoiceDate)}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <StatusBadge status={inv.status} />
                        {inv.isOverdue && <StatusBadge status="overdue" />}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-foreground">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold">
                      <span className={inv.balance > 0 ? "text-rose-600" : "text-emerald-600"}>
                        {formatCurrency(inv.balance)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Subscription Modal */}
      {canEdit && (
        <FormDialog<SubscriptionFormInput>
          open={editOpen}
          onOpenChange={setEditOpen}
          title={`Edit Subscription: ${sub.number}`}
          description="Update customer, plan, dates, and order lines."
          schema={subscriptionFormSchema}
          defaultValues={{
            templateId: "",
            customerId: sub.customerId,
            planId: sub.planId,
            startDate: sub.startDate,
            expiryDate: sub.expiryDate,
            quotationValidUntil: sub.quotationValidUntil,
            paymentTerms: sub.paymentTerms,
            lines: sub.lines.map((l) => ({
              productId: l.productId,
              variantId: l.variantId || "",
              quantity: l.quantity,
              taxIds: l.taxes.map((t) => t.id),
            })),
          }}
          onSubmit={handleEditSubmit}
          isLoading={updateMutation.isPending}
          submitLabel="Save Changes"
        >
          {(form) => (
            <SubscriptionFormFields
              register={form.register}
              control={form.control}
              watch={form.watch}
              setValue={form.setValue}
              errors={form.formState.errors}
              customers={customers}
              plans={plansData?.data}
              products={productsData?.data}
              taxes={taxes}
              templates={templates}
            />
          )}
        </FormDialog>
      )}

      {/* Close Confirmation Dialog (Admin only) */}
      {closeConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-xl p-5 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Close Subscription?
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Are you sure you want to close{" "}
                <strong className="text-foreground">{sub.number}</strong>? This will terminate recurring billing cycles for this contract.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setCloseConfirmOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={transitionMutation.isPending}
                onClick={() => {
                  setCloseConfirmOpen(false);
                  handleExecuteTransition("closed");
                }}
                className="px-3.5 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50"
              >
                {transitionMutation.isPending ? "Closing..." : "Close Subscription"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renew Confirmation Dialog (Admin only) */}
      {renewConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-xl p-5 space-y-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Renew Subscription?
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Extend contract expiration date for{" "}
                <strong className="text-foreground">{sub.number}</strong> for the next billing cycle.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setRenewConfirmOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={renewMutation.isPending}
                onClick={handleExecuteRenew}
                className="px-3.5 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-95 disabled:opacity-50"
              >
                {renewMutation.isPending ? "Renewing..." : "Confirm Renewal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

