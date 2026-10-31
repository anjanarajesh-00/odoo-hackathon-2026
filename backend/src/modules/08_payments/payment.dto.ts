import { z } from 'zod';

export const paymentMethodEnum = z.enum(['cash', 'card', 'bank_transfer', 'upi', 'cheque']);

export const recordPaymentSchema = z.object({
  method: paymentMethodEnum,
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  note: z.string().optional(),
});

export const paymentQuerySchema = z.object({
  invoiceId: z.string().optional(),
  method: paymentMethodEnum.optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export type RecordPaymentDto = z.infer<typeof recordPaymentSchema>;
export type PaymentQueryDto = z.infer<typeof paymentQuerySchema>;
