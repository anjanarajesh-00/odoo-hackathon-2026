import { z } from 'zod';

export const variantInputSchema = z.object({
  id: z.string().optional(),
  attribute: z.string().min(1, 'Attribute is required (e.g. Brand)'),
  value: z.string().min(1, 'Value is required (e.g. Odoo)'),
  extraPrice: z.coerce.number().default(0),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['service', 'goods']).default('service'),
  salesPrice: z.coerce.number().min(0, 'Sales price must be positive'),
  costPrice: z.coerce.number().min(0, 'Cost price must be positive').default(0),
  notes: z.string().optional(),
  variants: z.array(variantInputSchema).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['service', 'goods']).optional(),
  salesPrice: z.coerce.number().min(0).optional(),
  costPrice: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  variants: z.array(variantInputSchema).optional(),
});

export const productQuerySchema = z.object({
  type: z.enum(['service', 'goods']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export type VariantInput = z.infer<typeof variantInputSchema>;
export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
export type ProductQueryDto = z.infer<typeof productQuerySchema>;
