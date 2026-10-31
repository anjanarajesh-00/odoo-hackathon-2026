import { z } from 'zod';

export const billingPeriodEnum = z.enum(['daily', 'weekly', 'monthly', 'yearly']);
export const planStateEnum = z.enum(['open', 'paused', 'closed']);

export const createPlanSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  billingPeriod: billingPeriodEnum,
  minQuantity: z.coerce.number().min(1).default(1),
  availableFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  availableTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  autoClose: z.boolean().default(true),
  allowEarlyClose: z.boolean().default(true),
  allowPause: z.boolean().default(true),
  allowRenew: z.boolean().default(true),
  state: planStateEnum.default('open'),
});

export const updatePlanSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.coerce.number().min(0).optional(),
  billingPeriod: billingPeriodEnum.optional(),
  minQuantity: z.coerce.number().min(1).optional(),
  availableFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  availableTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  autoClose: z.boolean().optional(),
  allowEarlyClose: z.boolean().optional(),
  allowPause: z.boolean().optional(),
  allowRenew: z.boolean().optional(),
  state: planStateEnum.optional(),
});

export const renewPlanSchema = z.object({
  availableTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const planQuerySchema = z.object({
  state: planStateEnum.optional(),
  billingPeriod: billingPeriodEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export type CreatePlanDto = z.infer<typeof createPlanSchema>;
export type UpdatePlanDto = z.infer<typeof updatePlanSchema>;
export type RenewPlanDto = z.infer<typeof renewPlanSchema>;
export type PlanQueryDto = z.infer<typeof planQuerySchema>;
