import { ProductType } from '../../common/types/index.js';

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  sales_price: number;
  cost_price: number;
  notes?: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  attribute: string;
  value: string;
  extra_price: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProductResponseDto {
  id: string;
  name: string;
  type: ProductType;
  salesPrice: number;
  costPrice: number;
  notes?: string | null;
  variants: {
    id: string;
    attribute: string;
    value: string;
    extraPrice: number;
  }[];
}

export const formatProductResponse = (
  product: Product,
  variants: ProductVariant[] = []
): ProductResponseDto => ({
  id: product.id,
  name: product.name,
  type: product.type,
  salesPrice: Number(product.sales_price),
  costPrice: Number(product.cost_price),
  notes: product.notes || null,
  variants: variants.map((v) => ({
    id: v.id,
    attribute: v.attribute,
    value: v.value,
    extraPrice: Number(v.extra_price),
  })),
});
