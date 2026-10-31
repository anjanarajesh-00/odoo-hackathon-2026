import { z } from 'zod';

export const createTaxSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().default('percentage'),
  rate: z.coerce.number().min(0, 'Rate must be positive'),
  active: z.boolean().default(true),
});

export const updateTaxSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.string().optional(),
  rate: z.coerce.number().min(0).optional(),
  active: z.boolean().optional(),
});

export type CreateTaxDto = z.infer<typeof createTaxSchema>;
export type UpdateTaxDto = z.infer<typeof updateTaxSchema>;
