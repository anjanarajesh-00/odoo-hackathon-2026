export type UserRole = 'admin' | 'staff' | 'customer';
export type SubscriptionStatus = 'draft' | 'quotation' | 'confirmed' | 'active' | 'closed';
export type InvoiceStatus = 'draft' | 'confirmed' | 'paid' | 'cancelled';
export type BillingPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ProductType = 'service' | 'goods';
export type PlanCloseMode = 'auto' | 'manual';
export type PlanState = 'open' | 'paused' | 'closed';
export type DiscountType = 'fixed' | 'percentage';
export type DiscountAppliesTo = 'product' | 'subscription';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'upi' | 'cheque';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  customerId?: string;
}

export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SingleResponse<T> {
  data: T;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
