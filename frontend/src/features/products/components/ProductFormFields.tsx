import React from "react";
import { useFieldArray, Control, UseFormRegister, UseFormWatch, FieldErrors } from "react-hook-form";
import { Plus, Trash2, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { ProductInput } from "../schemas";

interface ProductFormFieldsProps {
  register: UseFormRegister<ProductInput>;
  control: Control<ProductInput>;
  watch: UseFormWatch<ProductInput>;
  errors: FieldErrors<ProductInput>;
}

export const ProductFormFields: React.FC<ProductFormFieldsProps> = ({
  register,
  control,
  watch,
  errors,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const baseSalesPrice = watch("salesPrice") || 0;
  const watchedVariants = watch("variants") || [];

  return (
    <div className="space-y-4 text-left">
      {/* Product Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground">
          Product Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          {...register("name")}
          placeholder="e.g. Cloud ERP Enterprise"
          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
        />
        {errors.name && (
          <p className="text-xs text-rose-500 font-medium">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Type, Sales Price, Cost Price */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Type <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("type")}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          >
            <option value="service">Service</option>
            <option value="goods">Goods / Hardware</option>
          </select>
          {errors.type && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.type.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Sales Price (₹) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register("salesPrice")}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
          {errors.salesPrice && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.salesPrice.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Cost Price (₹) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register("costPrice")}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
          {errors.costPrice && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.costPrice.message}
            </p>
          )}
        </div>
      </div>

      {/* Internal Notes */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground">
          Notes / Description
        </label>
        <textarea
          rows={2}
          {...register("notes")}
          placeholder="Optional internal specifications or customer description"
          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground resize-none"
        />
      </div>

      {/* Variants Section */}
      <div className="pt-2 border-t border-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-primary" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Product Variants
            </h4>
          </div>
          <button
            type="button"
            onClick={() =>
              append({ attribute: "Brand", value: "Odoo", extraPrice: 560 })
            }
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-muted hover:bg-muted/80 rounded border border-border text-foreground transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Variant</span>
          </button>
        </div>

        {fields.length === 0 ? (
          <p className="text-xs text-muted-foreground italic bg-muted/20 p-3 rounded-lg border border-dashed border-border text-center">
            No variants configured. Product sells at flat base price.
          </p>
        ) : (
          <div className="space-y-2.5">
            {fields.map((field, idx) => {
              const extra = Number(watchedVariants[idx]?.extraPrice || 0);
              const effectivePrice = Number(baseSalesPrice) + extra;

              return (
                <div
                  key={field.id}
                  className="p-3 bg-muted/30 border border-border rounded-lg space-y-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        {...register(`variants.${idx}.attribute` as const)}
                        placeholder="Attribute (e.g. Brand)"
                        className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        {...register(`variants.${idx}.value` as const)}
                        placeholder="Value (e.g. Odoo)"
                        className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">+₹</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          {...register(`variants.${idx}.extraPrice` as const)}
                          placeholder="Extra"
                          className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                        title="Remove variant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Effective price preview */}
                  <div className="text-[11px] text-muted-foreground flex items-center justify-between px-1">
                    <span>
                      Effective price:{" "}
                      <strong className="text-primary font-semibold">
                        {formatCurrency(effectivePrice)}
                      </strong>
                    </span>
                    <span className="text-[10px]">
                      (Base {formatCurrency(baseSalesPrice)} + {formatCurrency(extra)})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

