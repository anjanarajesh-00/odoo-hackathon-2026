import { z } from 'zod';

export const templateLineSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional().nullable(),
  quantity: z.coerce.number().min(1).default(1),
});

export const createTemplateSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  planId: z.string().min(1, 'Plan ID is required'),
  validityDays: z.coerce.number().min(1).default(30),
  lines: z.array(templateLineSchema).default([]),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(2).optional(),
  planId: z.string().min(1).optional(),
  validityDays: z.coerce.number().min(1).optional(),
  lines: z.array(templateLineSchema).optional(),
});

export type CreateTemplateDto = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateDto = z.infer<typeof updateTemplateSchema>;
