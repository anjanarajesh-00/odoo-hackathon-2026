import { z } from "zod";
import type { InvoiceStatus } from "@/types/enums";

export interface InvoiceLine {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  discountAmount: number;
  amount: number;
}

export interface InvoicePaymentSummary {
  id: string;
  method: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Invoice {
  id: string;
  number: string;
  status: InvoiceStatus;
  isOverdue: boolean;
  customerId: string;
  customer: {
    id: string;
    name: string;
    email?: string;
    company?: string;
  };
  subscriptionId: string;
  subscription: {
    id: string;
    number: string;
  };
  periodStart: string;
  periodEnd: string;
  invoiceDate: string;
  dueDate: string;
  lines: InvoiceLine[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  amountPaid: number;
  balance: number;
  payments: InvoicePaymentSummary[];
  createdAt: string;
}

export const generateInvoicesSchema = z.object({
  asOfDate: z.string().min(1, "As of date is required"),
});

export type GenerateInvoicesInput = z.infer<typeof generateInvoicesSchema>;

