import { z } from 'zod';

export const subscriptionStatusEnum = z.enum([
  'draft',
  'quotation',
  'confirmed',
  'active',
  'closed',
]);

export const subscriptionLineInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional().nullable(),
  quantity: z.coerce.number().min(1).default(1),
  taxIds: z.array(z.string()).optional().default([]),
});

export const createSubscriptionSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  planId: z.string().min(1, 'Plan ID is required'),
  templateId: z.string().optional().nullable(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  paymentTerms: z.string().default('Net 15'),
  lines: z.array(subscriptionLineInputSchema).optional(),
});

export const updateSubscriptionSchema = z.object({
  planId: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  paymentTerms: z.string().optional(),
  lines: z.array(subscriptionLineInputSchema).optional(),
});

export const transitionSubscriptionSchema = z.object({
  to: subscriptionStatusEnum,
  reason: z.string().optional(),
});

export const renewSubscriptionSchema = z.object({
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const subscriptionQuerySchema = z.object({
  status: subscriptionStatusEnum.optional(),
  customerId: z.string().optional(),
  planId: z.string().optional(),
  expiringBefore: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export type SubscriptionLineInput = z.infer<typeof subscriptionLineInputSchema>;
export type CreateSubscriptionDto = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionDto = z.infer<typeof updateSubscriptionSchema>;
export type TransitionSubscriptionDto = z.infer<typeof transitionSubscriptionSchema>;
export type RenewSubscriptionDto = z.infer<typeof renewSubscriptionSchema>;
export type SubscriptionQueryDto = z.infer<typeof subscriptionQuerySchema>;
