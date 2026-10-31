import React, { useMemo } from "react";
import { FormDialog } from "@/components/shared/FormDialog";
import { useRecordPayment } from "../api";
import {
  createRecordPaymentSchema,
  type RecordPaymentInput,
} from "../schemas";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/types/enums";
import { formatCurrency } from "@/lib/formatters";
import type { Invoice } from "@/features/invoices/schemas";
import { CreditCard, Zap, CheckCircle2 } from "lucide-react";

interface RecordPaymentDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const RecordPaymentDialog: React.FC<RecordPaymentDialogProps> = ({
  invoice,
  open,
  onOpenChange,
  onSuccess,
}) => {
  if (!invoice) return null;

  const recordPaymentMutation = useRecordPayment(invoice.id);
  const schema = useMemo(() => createRecordPaymentSchema(invoice.balance), [invoice.balance]);

  const handleSubmit = async (values: RecordPaymentInput) => {
    await recordPaymentMutation.mutateAsync(values);
    onOpenChange(false);
    if (onSuccess) onSuccess();
  };

  return (
    <FormDialog<RecordPaymentInput>
      open={open}
      onOpenChange={onOpenChange}
      title={`Record Payment: ${invoice.number}`}
      description="Record customer settlement, partial payment, or full clearance against this confirmed invoice."
      schema={schema}
      defaultValues={{
        method: "bank_transfer",
        amount: invoice.balance,
        date: new Date().toISOString().split("T")[0],
        note: "",
      }}
      onSubmit={handleSubmit}
      isLoading={recordPaymentMutation.isPending}
      submitLabel="Record Payment"
    >
      {(form) => (
        <div className="space-y-4 text-left">
          {/* Read-only Context Summary Card */}
          <div className="p-3.5 bg-muted/40 border border-border rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Customer:</span>
              <span className="font-bold text-foreground">
                {invoice.customer.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Invoice Total:</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(invoice.total)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Already Paid:</span>
              <span className="font-semibold text-emerald-600">
                {formatCurrency(invoice.amountPaid)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border font-bold">
              <span className="text-foreground">Balance Due:</span>
              <span className="text-rose-600 text-sm">
                {formatCurrency(invoice.balance)}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Payment Method <span className="text-rose-500">*</span>
            </label>
            <select
              {...form.register("method")}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            >
              {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((key) => (
                <option key={key} value={key}>
                  {PAYMENT_METHOD_LABELS[key]}
                </option>
              ))}
            </select>
            {form.formState.errors.method && (
              <p className="text-xs text-rose-500 font-medium">
                {form.formState.errors.method.message}
              </p>
            )}
          </div>

          {/* Amount with "Pay Full Balance" shortcut */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  form.setValue("amount", invoice.balance, { shouldValidate: true })
                }
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
              >
                <Zap className="w-3 h-3" />
                <span>Pay Full Balance ({formatCurrency(invoice.balance)})</span>
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={invoice.balance}
              {...form.register("amount")}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-semibold"
            />
            {form.formState.errors.amount && (
              <p className="text-xs text-rose-500 font-medium">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          {/* Payment Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Payment Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              max={new Date().toISOString().split("T")[0]}
              {...form.register("date")}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
            {form.formState.errors.date && (
              <p className="text-xs text-rose-500 font-medium">
                {form.formState.errors.date.message}
              </p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Transaction Reference / Note
            </label>
            <textarea
              rows={2}
              {...form.register("note")}
              placeholder="e.g. UPI Ref # 9382104829 or Cheque clearance ID"
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground resize-none"
            />
            {form.formState.errors.note && (
              <p className="text-xs text-rose-500 font-medium">
                {form.formState.errors.note.message}
              </p>
            )}
          </div>
        </div>
      )}
    </FormDialog>
  );
};

