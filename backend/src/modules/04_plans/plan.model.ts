import { BillingPeriod, PlanState } from '../../common/types/index.js';

export interface Plan {
  id: string;
  name: string;
  price: number;
  billing_period: BillingPeriod;
  min_quantity: number;
  available_from: string;
  available_to?: string | null;
  auto_close: boolean;
  allow_early_close: boolean;
  allow_pause: boolean;
  allow_renew: boolean;
  state: PlanState;
  created_at: Date;
  updated_at: Date;
}

export interface PlanResponseDto {
  id: string;
  name: string;
  price: number;
  billingPeriod: BillingPeriod;
  minQuantity: number;
  availableFrom: string;
  availableTo?: string | null;
  autoClose: boolean;
  allowEarlyClose: boolean;
  allowPause: boolean;
  allowRenew: boolean;
  state: PlanState;
}

export const formatPlanResponse = (plan: Plan): PlanResponseDto => {
  // Dynamic auto-close check if availableTo has passed
  let state = plan.state;
  if (plan.auto_close && plan.available_to && state === 'open') {
    const today = new Date().toISOString().split('T')[0];
    if (today > plan.available_to) {
      state = 'closed';
    }
  }

  return {
    id: plan.id,
    name: plan.name,
    price: Number(plan.price),
    billingPeriod: plan.billing_period,
    minQuantity: Number(plan.min_quantity),
    availableFrom: plan.available_from,
    availableTo: plan.available_to || null,
    autoClose: Boolean(plan.auto_close),
    allowEarlyClose: Boolean(plan.allow_early_close),
    allowPause: Boolean(plan.allow_pause),
    allowRenew: Boolean(plan.allow_renew),
    state,
  };
};
