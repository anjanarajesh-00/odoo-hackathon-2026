import { z } from "zod";
import type { PaymentMethod } from "@/types/enums";

export const paymentMethodsEnum = z.enum(["cash", "card", "bank_transfer", "upi", "cheque"], {
  errorMap: () => ({ message: "Select a valid payment method" }),
});

export const createRecordPaymentSchema = (balance: number) =>
  z.object({
    method: paymentMethodsEnum,
    amount: z.coerce
      .number()
      .positive("Amount must be greater than zero")
      .max(balance, `Amount cannot exceed the balance of ₹${balance.toFixed(2)}`),
    date: z
      .string()
      .min(1, "Payment date is required")
      .refine(
        (val) => {
          const selected = new Date(val).getTime();
          const today = new Date().setHours(23, 59, 59, 999);
          return selected <= today;
        },
        { message: "Payment date cannot be in the future" }
      ),
    note: z.string().max(250, "Note must not exceed 250 characters"),
  });

export type RecordPaymentInput = {
  method: "cash" | "card" | "bank_transfer" | "upi" | "cheque";
  amount: number;
  date: string;
  note: string;
};

export interface Payment {
  id: string;
  invoiceId: string;
  invoice: {
    id: string;
    number: string;
  };
  customerId: string;
  customer: {
    id: string;
    name: string;
  };
  method: PaymentMethod;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
}
