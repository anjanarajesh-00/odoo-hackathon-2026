import crypto from 'node:crypto';
import { discountRepository } from './discount.repository.js';
import { CreateDiscountDto, UpdateDiscountDto } from './discount.dto.js';
import { DiscountResponseDto, formatDiscountResponse, Discount } from './discount.model.js';
import { AppError } from '../../common/errors/AppError.js';

export class DiscountService {
  async create(dto: CreateDiscountDto): Promise<DiscountResponseDto> {
    const discount = await discountRepository.create({
      id: `d_${crypto.randomUUID().slice(0, 8)}`,
      name: dto.name.trim(),
      type: dto.type,
      value: dto.value,
      min_purchase: dto.minPurchase,
      min_quantity: dto.minQuantity,
      start_date: dto.startDate,
      end_date: dto.endDate,
      usage_limit: dto.usageLimit,
      used_count: 0,
      applies_to: dto.appliesTo,
      product_ids: JSON.stringify(dto.productIds || []),
      subscription_ids: JSON.stringify(dto.subscriptionIds || []),
      active: true,
    });

    return formatDiscountResponse(discount);
  }

  async update(id: string, dto: UpdateDiscountDto): Promise<DiscountResponseDto> {
    const existing = await discountRepository.findById(id);
    if (!existing) throw AppError.notFound(`Discount "${id}" not found`);

    const payload: any = {};
    if (dto.name !== undefined) payload.name = dto.name.trim();
    if (dto.type !== undefined) payload.type = dto.type;
    if (dto.value !== undefined) payload.value = dto.value;
    if (dto.minPurchase !== undefined) payload.min_purchase = dto.minPurchase;
    if (dto.minQuantity !== undefined) payload.min_quantity = dto.minQuantity;
    if (dto.startDate !== undefined) payload.start_date = dto.startDate;
    if (dto.endDate !== undefined) payload.end_date = dto.endDate;
    if (dto.usageLimit !== undefined) payload.usage_limit = dto.usageLimit;
    if (dto.appliesTo !== undefined) payload.applies_to = dto.appliesTo;
    if (dto.productIds !== undefined) payload.product_ids = JSON.stringify(dto.productIds);
    if (dto.subscriptionIds !== undefined) payload.subscription_ids = JSON.stringify(dto.subscriptionIds);
    if (dto.active !== undefined) payload.active = dto.active;

    const updated = await discountRepository.update(id, payload);
    return formatDiscountResponse(updated!);
  }

  async getById(id: string): Promise<DiscountResponseDto> {
    const discount = await discountRepository.findById(id);
    if (!discount) throw AppError.notFound(`Discount "${id}" not found`);
    return formatDiscountResponse(discount);
  }

  async list(filter?: { active?: boolean; search?: string }): Promise<DiscountResponseDto[]> {
    const discounts = await discountRepository.findAll(filter);
    return discounts.map(formatDiscountResponse);
  }

  async delete(id: string): Promise<void> {
    const existing = await discountRepository.findById(id);
    if (!existing) throw AppError.notFound(`Discount "${id}" not found`);
    await discountRepository.delete(id);
  }

  // Matches discount rules against a billable subscription
  async evaluateDiscountForSubscription(
    subscriptionId: string,
    subtotal: number,
    totalQuantity: number,
    productIdsInSub: string[]
  ): Promise<{ discountAmount: number; appliedDiscountId?: string }> {
    const today = new Date().toISOString().split('T')[0];
    const discounts = await discountRepository.findAll({ active: true });

    let bestDiscount = 0;
    let appliedDiscountId: string | undefined = undefined;

    for (const d of discounts) {
      // Check date validity
      if (today < d.start_date || today > d.end_date) continue;

      // Check usage limit
      if (d.usage_limit > 0 && d.used_count >= d.usage_limit) continue;

      // Check min purchase & min quantity
      if (subtotal < Number(d.min_purchase)) continue;
      if (totalQuantity < Number(d.min_quantity)) continue;

      // Check scope
      if (d.applies_to === 'subscription') {
        let subIds: string[] = [];
        try {
          if (d.subscription_ids) subIds = JSON.parse(d.subscription_ids);
        } catch (e) {}
        if (subIds.length > 0 && !subIds.includes(subscriptionId)) continue;
      } else if (d.applies_to === 'product') {
        let pIds: string[] = [];
        try {
          if (d.product_ids) pIds = JSON.parse(d.product_ids);
        } catch (e) {}
        if (pIds.length > 0 && !pIds.some((id) => productIdsInSub.includes(id))) continue;
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (d.type === 'percentage') {
        discountAmount = (subtotal * Number(d.value)) / 100;
      } else {
        discountAmount = Number(d.value);
      }

      if (discountAmount > bestDiscount) {
        bestDiscount = discountAmount;
        appliedDiscountId = d.id;
      }
    }

    return {
      discountAmount: Math.min(bestDiscount, subtotal),
      appliedDiscountId,
    };
  }
}

export const discountService = new DiscountService();
