import { SubscriptionStatus } from '../../common/types/index.js';
export type { SubscriptionStatus };

export interface Subscription {
  id: string;
  number: string;
  status: SubscriptionStatus;
  customer_id: string;
  plan_id: string;
  start_date: string;
  expiry_date?: string | null;
  quotation_valid_until?: string | null;
  next_invoice_date: string;
  payment_terms: string;
  subtotal: number;
  tax_total: number;
  discount_total: number;
  total: number;
  created_at: Date;
  updated_at: Date;
}

export interface SubscriptionLine {
  id: string;
  subscription_id: string;
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  unit_price: number;
  tax_ids?: string | null; // JSON array
  tax_amount: number;
  discount_amount: number;
  amount: number;
  created_at: Date;
  updated_at: Date;
}

export interface SubscriptionHistory {
  id: string;
  subscription_id: string;
  from_status: string;
  to_status: string;
  changed_by?: string | null;
  reason?: string | null;
  created_at: Date;
}

export interface SubscriptionLineResponseDto {
  id: string;
  product: { id: string; name: string };
  variant?: { id: string; value: string } | null;
  quantity: number;
  unitPrice: number;
  taxes: { id: string; name: string; amount: number }[];
  discountAmount: number;
  amount: number;
}

export interface SubscriptionResponseDto {
  id: string;
  number: string;
  status: SubscriptionStatus;
  customer: { id: string; name: string };
  plan: { id: string; name: string; billingPeriod: string };
  startDate: string;
  expiryDate?: string | null;
  quotationValidUntil?: string | null;
  nextInvoiceDate: string;
  paymentTerms: string;
  lines: SubscriptionLineResponseDto[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  createdAt: string;
}
