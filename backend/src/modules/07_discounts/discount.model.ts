import { DiscountType, DiscountAppliesTo } from '../../common/types/index.js';

export interface Discount {
  id: string;
  name: string;
  type: DiscountType;
  value: number;
  min_purchase: number;
  min_quantity: number;
  start_date: string;
  end_date: string;
  usage_limit: number;
  used_count: number;
  applies_to: DiscountAppliesTo;
  product_ids?: string | null; // JSON string
  subscription_ids?: string | null; // JSON string
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DiscountResponseDto {
  id: string;
  name: string;
  type: DiscountType;
  value: number;
  minPurchase: number;
  minQuantity: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  appliesTo: DiscountAppliesTo;
  productIds: string[];
  subscriptionIds: string[];
  active?: boolean;
}

export const formatDiscountResponse = (d: Discount): DiscountResponseDto => {
  let productIds: string[] = [];
  let subscriptionIds: string[] = [];
  try {
    if (d.product_ids) productIds = JSON.parse(d.product_ids);
  } catch (e) {}
  try {
    if (d.subscription_ids) subscriptionIds = JSON.parse(d.subscription_ids);
  } catch (e) {}

  return {
    id: d.id,
    name: d.name,
    type: d.type,
    value: Number(d.value),
    minPurchase: Number(d.min_purchase),
    minQuantity: Number(d.min_quantity),
    startDate: d.start_date,
    endDate: d.end_date,
    usageLimit: Number(d.usage_limit),
    usedCount: Number(d.used_count),
    appliesTo: d.applies_to,
    productIds,
    subscriptionIds,
    active: Boolean(d.active),
  };
};
