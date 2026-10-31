import { z } from "zod";
import type { SubscriptionStatus } from "@/types/enums";

export const subscriptionLineSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  variantId: z.string().optional(),
  quantity: z.coerce.number().int("Quantity must be an integer").min(1, "Quantity must be at least 1"),
  taxIds: z.array(z.string()),
});

export const subscriptionFormSchema = z
  .object({
    templateId: z.string().optional(),
    customerId: z.string().min(1, "Customer is required"),
    planId: z.string().min(1, "Plan is required"),
    startDate: z.string().min(1, "Start date is required"),
    expiryDate: z.string().min(1, "Expiry date is required"),
    quotationValidUntil: z.string().optional(),
    paymentTerms: z.enum(["Immediate", "Net 15", "Net 30", "Net 60"], {
      errorMap: () => ({ message: "Select payment terms" }),
    }),
    lines: z.array(subscriptionLineSchema).min(1, "At least one product line is required"),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.expiryDate) return true;
      return new Date(data.expiryDate).getTime() > new Date(data.startDate).getTime();
    },
    {
      message: "Expiry date must be after start date",
      path: ["expiryDate"],
    }
  );

export type SubscriptionLineInput = z.infer<typeof subscriptionLineSchema>;
export type SubscriptionFormInput = z.infer<typeof subscriptionFormSchema>;

export interface SubscriptionTaxDetail {
  id: string;
  name: string;
  amount: number;
}

export interface SubscriptionLineDetail {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    salesPrice: number;
  };
  variantId?: string;
  variant?: {
    id: string;
    value: string;
    extraPrice: number;
  };
  quantity: number;
  unitPrice: number;
  taxes: SubscriptionTaxDetail[];
  discountAmount: number;
  amount: number;
}

export interface Subscription {
  id: string;
  number: string;
  status: SubscriptionStatus;
  customerId: string;
  customer: {
    id: string;
    name: string;
    email?: string;
  };
  planId: string;
  plan: {
    id: string;
    name: string;
    billingPeriod: string;
    minQuantity: number;
  };
  startDate: string;
  expiryDate: string;
  quotationValidUntil?: string;
  nextInvoiceDate?: string;
  paymentTerms: "Immediate" | "Net 15" | "Net 30" | "Net 60";
  lines: SubscriptionLineDetail[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  createdAt: string;
}

export interface SubscriptionHistoryItem {
  id?: string;
  from: SubscriptionStatus | "created";
  to: SubscriptionStatus;
  by: string;
  at: string;
  note?: string;
}

export interface CustomerLookup {
  id: string;
  name: string;
  email: string;
  company?: string;
}

export interface TaxLookup {
  id: string;
  name: string;
  rate: number;
}

export interface QuotationTemplate {
  id: string;
  name: string;
  planId: string;
  validityDays: number;
  lines: {
    productId: string;
    variantId?: string;
    quantity: number;
  }[];
}
