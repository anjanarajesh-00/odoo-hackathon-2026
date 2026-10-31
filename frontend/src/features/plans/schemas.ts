import { z } from "zod";
import type { PlanState } from "@/types/enums";

export const planSchema = z
  .object({
    name: z.string().min(1, "Plan name is required"),
    price: z.coerce.number().positive("Price must be greater than zero"),
    billingPeriod: z.enum(["daily", "weekly", "monthly", "yearly"], {
      errorMap: () => ({ message: "Select a valid billing frequency" }),
    }),
    minQuantity: z.coerce
      .number()
      .int("Minimum quantity must be a whole number")
      .min(1, "Minimum quantity must be at least 1"),
    availableFrom: z.string().min(1, "Available from date is required"),
    availableTo: z.string().min(1, "Available to date is required"),
    autoClose: z.boolean(),
    allowEarlyClose: z.boolean(),
    allowPause: z.boolean(),
    allowRenew: z.boolean(),
  })
  .refine(
    (data) => {
      if (!data.availableFrom || !data.availableTo) return true;
      return new Date(data.availableTo).getTime() > new Date(data.availableFrom).getTime();
    },
    {
      message: "End date (Available to) must be strictly after start date (Available from)",
      path: ["availableTo"],
    }
  );

export const renewPlanSchema = z.object({
  availableTo: z.string().min(1, "New end date is required"),
});

export type PlanInput = z.infer<typeof planSchema>;
export type RenewPlanInput = z.infer<typeof renewPlanSchema>;

export interface Plan {
  id: string;
  name: string;
  price: number;
  billingPeriod: "daily" | "weekly" | "monthly" | "yearly";
  minQuantity: number;
  availableFrom: string;
  availableTo: string;
  autoClose: boolean;
  allowEarlyClose: boolean;
  allowPause: boolean;
  allowRenew: boolean;
  state: PlanState;
}
