import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import type { PlanInput } from "../schemas";

interface PlanFormFieldsProps {
  register: UseFormRegister<PlanInput>;
  errors: FieldErrors<PlanInput>;
}

export const PlanFormFields: React.FC<PlanFormFieldsProps> = ({
  register,
  errors,
}) => {
  return (
    <div className="space-y-4 text-left">
      {/* Plan Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground">
          Plan Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          {...register("name")}
          placeholder="e.g. Starter Monthly Billing"
          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
        />
        {errors.name && (
          <p className="text-xs text-rose-500 font-medium">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Price, Billing Period, Min Quantity */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Price (₹) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            {...register("price")}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
          {errors.price && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.price.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Billing Frequency <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("billingPeriod")}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground capitalize"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          {errors.billingPeriod && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.billingPeriod.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Min Quantity <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            step="1"
            {...register("minQuantity")}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
          {errors.minQuantity && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.minQuantity.message}
            </p>
          )}
        </div>
      </div>

      {/* Date Window */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Available From <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            {...register("availableFrom")}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
          {errors.availableFrom && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.availableFrom.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Available To <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            {...register("availableTo")}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
          {errors.availableTo && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.availableTo.message}
            </p>
          )}
        </div>
      </div>

      {/* 4 Boolean Flags / Switches */}
      <div className="pt-2 border-t border-border space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
          Lifecycle & Renewal Flags
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
            <input
              type="checkbox"
              {...register("autoClose")}
              className="mt-0.5 rounded border-border text-primary focus:ring-primary"
            />
            <div className="text-xs">
              <span className="font-semibold text-foreground block">Auto Close</span>
              <span className="text-muted-foreground text-[11px]">
                Closes on its own when the availability end date is reached.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
            <input
              type="checkbox"
              {...register("allowEarlyClose")}
              className="mt-0.5 rounded border-border text-primary focus:ring-primary"
            />
            <div className="text-xs">
              <span className="font-semibold text-foreground block">
                Allow Early Close
              </span>
              <span className="text-muted-foreground text-[11px]">
                Enables manual early closure before official end date.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
            <input
              type="checkbox"
              {...register("allowPause")}
              className="mt-0.5 rounded border-border text-primary focus:ring-primary"
            />
            <div className="text-xs">
              <span className="font-semibold text-foreground block">Allow Pause</span>
              <span className="text-muted-foreground text-[11px]">
                Allows temporarily pausing sales and billing for this plan.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
            <input
              type="checkbox"
              {...register("allowRenew")}
              className="mt-0.5 rounded border-border text-primary focus:ring-primary"
            />
            <div className="text-xs">
              <span className="font-semibold text-foreground block">Allow Renew</span>
              <span className="text-muted-foreground text-[11px]">
                Permits extending the availability window to a future date.
              </span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

