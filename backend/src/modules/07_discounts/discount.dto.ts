import { z } from 'zod';

export const discountTypeEnum = z.enum(['fixed', 'percentage']);
export const discountAppliesToEnum = z.enum(['product', 'subscription']);

export const createDiscountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: discountTypeEnum,
  value: z.coerce.number().min(0, 'Value must be positive'),
  minPurchase: z.coerce.number().default(0),
  minQuantity: z.coerce.number().default(0),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  usageLimit: z.coerce.number().default(0),
  appliesTo: discountAppliesToEnum.default('product'),
  productIds: z.array(z.string()).default([]),
  subscriptionIds: z.array(z.string()).default([]),
});

export const updateDiscountSchema = z.object({
  name: z.string().min(1).optional(),
  type: discountTypeEnum.optional(),
  value: z.coerce.number().min(0).optional(),
  minPurchase: z.coerce.number().optional(),
  minQuantity: z.coerce.number().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  usageLimit: z.coerce.number().optional(),
  appliesTo: discountAppliesToEnum.optional(),
  productIds: z.array(z.string()).optional(),
  subscriptionIds: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});

export const discountQuerySchema = z.object({
  active: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export type CreateDiscountDto = z.infer<typeof createDiscountSchema>;
export type UpdateDiscountDto = z.infer<typeof updateDiscountSchema>;
export type DiscountQueryDto = z.infer<typeof discountQuerySchema>;
