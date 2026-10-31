import { z } from "zod";

export const variantSchema = z.object({
  id: z.string().optional(),
  attribute: z.string().min(1, "Attribute name is required (e.g. Brand)"),
  value: z.string().min(1, "Variant value is required (e.g. Odoo)"),
  extraPrice: z.coerce.number().min(0, "Extra price cannot be negative"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  type: z.enum(["service", "goods"], {
    errorMap: () => ({ message: "Select a valid product type" }),
  }),
  salesPrice: z.coerce.number().min(0, "Sales price cannot be negative"),
  costPrice: z.coerce.number().min(0, "Cost price cannot be negative"),
  notes: z.string().optional(),
  variants: z.array(variantSchema),
});

export type VariantInput = z.infer<typeof variantSchema>;
export type ProductInput = z.infer<typeof productSchema>;

export interface Product {
  id: string;
  name: string;
  type: "service" | "goods";
  salesPrice: number;
  costPrice: number;
  notes?: string;
  variants: VariantInput[];
}
