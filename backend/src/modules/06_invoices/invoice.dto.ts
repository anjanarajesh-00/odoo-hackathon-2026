import { z } from 'zod';

export const invoiceStatusEnum = z.enum(['draft', 'confirmed', 'paid', 'cancelled']);

export const createInvoiceManualSchema = z.object({
  subscriptionId: z.string().min(1, 'Subscription ID is required'),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const generateInvoicesSchema = z.object({
  asOfDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD')
    .optional(),
});

export const invoiceQuerySchema = z.object({
  status: invoiceStatusEnum.optional(),
  overdue: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  customerId: z.string().optional(),
  subscriptionId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export type CreateInvoiceManualDto = z.infer<typeof createInvoiceManualSchema>;
export type GenerateInvoicesDto = z.infer<typeof generateInvoicesSchema>;
export type InvoiceQueryDto = z.infer<typeof invoiceQuerySchema>;
