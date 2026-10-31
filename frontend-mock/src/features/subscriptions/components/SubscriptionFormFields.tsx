import React, { useEffect, useMemo } from "react";
import {
  useFieldArray,
  Control,
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import { Plus, Trash2, Sparkles, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { SubscriptionFormInput, CustomerLookup, TaxLookup, QuotationTemplate } from "../schemas";
import type { Product } from "@/features/products/schemas";
import type { Plan } from "@/features/plans/schemas";

interface SubscriptionFormFieldsProps {
  register: UseFormRegister<SubscriptionFormInput>;
  control: Control<SubscriptionFormInput>;
  watch: UseFormWatch<SubscriptionFormInput>;
  setValue: UseFormSetValue<SubscriptionFormInput>;
  errors: FieldErrors<SubscriptionFormInput>;
  customers?: CustomerLookup[];
  plans?: Plan[];
  products?: Product[];
  taxes?: TaxLookup[];
  templates?: QuotationTemplate[];
}

export const SubscriptionFormFields: React.FC<SubscriptionFormFieldsProps> = ({
  register,
  control,
  watch,
  setValue,
  errors,
  customers = [],
  plans = [],
  products = [],
  taxes = [],
  templates = [],
}) => {
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "lines",
  });

  const selectedPlanId = watch("planId");
  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const watchedLines = watch("lines") || [];

  // Handle template selection
  const handleTemplateChange = (templateId: string) => {
    if (!templateId) return;
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;

    setValue("planId", tpl.planId, { shouldValidate: true });

    // Set expiry based on validityDays
    const today = new Date();
    const expiry = new Date(today.getTime() + tpl.validityDays * 86400000);
    setValue("expiryDate", expiry.toISOString().split("T")[0], { shouldValidate: true });
    setValue("quotationValidUntil", expiry.toISOString().split("T")[0]);

    if (tpl.lines && tpl.lines.length > 0) {
      const newLines = tpl.lines.map((l) => ({
        productId: l.productId,
        variantId: l.variantId || "",
        quantity: l.quantity,
        taxIds: taxes.length > 0 ? [taxes[0].id] : [],
      }));
      replace(newLines);
    }
  };

  // Compute live estimate total
  const estimatedSubtotal = useMemo(() => {
    return watchedLines.reduce((acc, line) => {
      const prod = products.find((p) => p.id === line.productId);
      if (!prod) return acc;
      const variant = prod.variants?.find((v) => v.id === line.variantId);
      const unit = prod.salesPrice + (variant ? variant.extraPrice : 0);
      return acc + unit * (Number(line.quantity) || 0);
    }, 0);
  }, [watchedLines, products]);

  const estimatedTax = useMemo(() => {
    return watchedLines.reduce((acc, line) => {
      const prod = products.find((p) => p.id === line.productId);
      if (!prod) return acc;
      const variant = prod.variants?.find((v) => v.id === line.variantId);
      const unit = prod.salesPrice + (variant ? variant.extraPrice : 0);
      const lineSub = unit * (Number(line.quantity) || 0);

      const taxRate = (line.taxIds || []).reduce((tAcc, tId) => {
        const tax = taxes.find((t) => t.id === tId);
        return tAcc + (tax?.rate || 0);
      }, 0);

      return acc + lineSub * taxRate;
    }, 0);
  }, [watchedLines, products, taxes]);

  const estimatedTotal = estimatedSubtotal + estimatedTax;

  return (
    <div className="space-y-4 text-left">
      {/* Template picker */}
      {templates.length > 0 && (
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Optional: Start from Quotation Template</span>
          </div>
          <select
            {...register("templateId")}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">-- Choose a template to pre-fill lines --</option>
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name} (Valid {tpl.validityDays} days)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Customer & Plan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Customer <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("customerId")}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          >
            <option value="">Select customer...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.company ? `(${c.company})` : ""}
              </option>
            ))}
          </select>
          {errors.customerId && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.customerId.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Subscription Plan <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("planId")}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          >
            <option value="">Select plan...</option>
            {plans
              .filter((p) => p.state === "open")
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatCurrency(p.price)} / {p.billingPeriod} (Min: {p.minQuantity})
                </option>
              ))}
          </select>
          {errors.planId && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.planId.message}
            </p>
          )}
        </div>
      </div>

      {/* Date Fields & Payment Terms */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Start Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            {...register("startDate")}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
          {errors.startDate && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.startDate.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Expiry Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            {...register("expiryDate")}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
          {errors.expiryDate && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.expiryDate.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Payment Terms <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("paymentTerms")}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          >
            <option value="Immediate">Immediate</option>
            <option value="Net 15">Net 15</option>
            <option value="Net 30">Net 30</option>
            <option value="Net 60">Net 60</option>
          </select>
          {errors.paymentTerms && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.paymentTerms.message}
            </p>
          )}
        </div>
      </div>

      {/* Product Lines Section */}
      <div className="pt-2 border-t border-border space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Subscription Lines
            </h4>
            {selectedPlan && (
              <p className="text-[11px] text-muted-foreground">
                Minimum order requirement:{" "}
                <span className="font-semibold text-foreground">{selectedPlan.minQuantity} items</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() =>
              append({
                productId: products[0]?.id || "",
                variantId: "",
                quantity: selectedPlan ? selectedPlan.minQuantity : 1,
                taxIds: taxes.length > 0 ? [taxes[0].id] : [],
              })
            }
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-muted hover:bg-muted/80 rounded border border-border text-foreground transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>

        {errors.lines && typeof errors.lines.message === "string" && (
          <p className="text-xs text-rose-500 font-medium">{errors.lines.message}</p>
        )}

        <div className="space-y-3">
          {fields.map((field, idx) => {
            const currentLine = watchedLines[idx] || {};
            const product = products.find((p) => p.id === currentLine.productId);
            const variants = product?.variants || [];
            const selectedVariant = variants.find((v) => v.id === currentLine.variantId);
            const unitPrice = (product?.salesPrice || 0) + (selectedVariant?.extraPrice || 0);

            return (
              <div
                key={field.id}
                className="p-3 bg-muted/30 border border-border rounded-lg space-y-2 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start">
                  {/* Product */}
                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Product
                    </label>
                    <select
                      {...register(`lines.${idx}.productId` as const)}
                      onChange={(e) => {
                        setValue(`lines.${idx}.productId`, e.target.value);
                        setValue(`lines.${idx}.variantId`, ""); // reset variant when product changes
                      }}
                      className="w-full px-2 py-1.5 bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Select product...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Variant */}
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Variant
                    </label>
                    <select
                      {...register(`lines.${idx}.variantId` as const)}
                      disabled={variants.length === 0}
                      className="w-full px-2 py-1.5 bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                    >
                      <option value="">None / Base</option>
                      {variants.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.attribute}: {v.value} (+₹{v.extraPrice})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      {...register(`lines.${idx}.quantity` as const)}
                      className="w-full px-2 py-1.5 bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Unit price display */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Unit Price
                    </label>
                    <div className="py-1.5 px-2 bg-muted rounded font-semibold text-foreground truncate">
                      {formatCurrency(unitPrice)}
                    </div>
                  </div>

                  {/* Remove button */}
                  <div className="sm:col-span-1 flex items-center justify-end pt-5">
                    <button
                      type="button"
                      disabled={fields.length <= 1}
                      onClick={() => remove(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors disabled:opacity-30"
                      title="Remove line"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Taxes & Line Total */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">Taxes:</span>
                    {taxes.map((tax) => {
                      const taxIds = currentLine.taxIds || [];
                      const isChecked = taxIds.includes(tax.id);
                      return (
                        <label key={tax.id} className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...taxIds, tax.id]
                                : taxIds.filter((id: string) => id !== tax.id);
                              setValue(`lines.${idx}.taxIds`, next);
                            }}
                            className="rounded border-border text-primary focus:ring-primary"
                          />
                          <span>{tax.name}</span>
                        </label>
                      );
                    })}
                  </div>

                  <div>
                    Estimated line amount:{" "}
                    <strong className="text-foreground font-semibold">
                      {formatCurrency(unitPrice * (Number(currentLine.quantity) || 0))}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Estimated Totals Box */}
      <div className="p-3 rounded-lg bg-muted/40 border border-border flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Final totals are computed on server save</span>
        </div>
        <div className="text-right">
          <span className="text-muted-foreground mr-2">Estimated Total:</span>
          <span className="text-sm font-bold text-primary">
            {formatCurrency(estimatedTotal)}
          </span>
        </div>
      </div>
    </div>
  );
};

