import crypto from 'node:crypto';
import { IPlanRepository, planRepository } from './plan.repository.js';
import {
  CreatePlanDto,
  UpdatePlanDto,
  RenewPlanDto,
  PlanQueryDto,
} from './plan.dto.js';
import { PlanResponseDto, formatPlanResponse } from './plan.model.js';
import { AppError } from '../../common/errors/AppError.js';

export class PlanService {
  constructor(private repo: IPlanRepository = planRepository) {}

  async createPlan(dto: CreatePlanDto): Promise<PlanResponseDto> {
    const plan = await this.repo.create({
      id: `pl_${crypto.randomUUID().slice(0, 8)}`,
      name: dto.name.trim(),
      price: dto.price,
      billing_period: dto.billingPeriod,
      min_quantity: dto.minQuantity,
      available_from: dto.availableFrom,
      available_to: dto.availableTo || null,
      auto_close: dto.autoClose,
      allow_early_close: dto.allowEarlyClose,
      allow_pause: dto.allowPause,
      allow_renew: dto.allowRenew,
      state: dto.state || 'open',
    });

    return formatPlanResponse(plan);
  }

  async updatePlan(id: string, dto: UpdatePlanDto): Promise<PlanResponseDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw AppError.notFound(`Plan "${id}" not found`);
    }

    const payload: any = {};
    if (dto.name !== undefined) payload.name = dto.name.trim();
    if (dto.price !== undefined) payload.price = dto.price;
    if (dto.billingPeriod !== undefined) payload.billing_period = dto.billingPeriod;
    if (dto.minQuantity !== undefined) payload.min_quantity = dto.minQuantity;
    if (dto.availableFrom !== undefined) payload.available_from = dto.availableFrom;
    if (dto.availableTo !== undefined) payload.available_to = dto.availableTo;
    if (dto.autoClose !== undefined) payload.auto_close = dto.autoClose;
    if (dto.allowEarlyClose !== undefined) payload.allow_early_close = dto.allowEarlyClose;
    if (dto.allowPause !== undefined) payload.allow_pause = dto.allowPause;
    if (dto.allowRenew !== undefined) payload.allow_renew = dto.allowRenew;
    if (dto.state !== undefined) payload.state = dto.state;

    const updated = await this.repo.update(id, payload);
    return formatPlanResponse(updated!);
  }

  async pausePlan(id: string): Promise<PlanResponseDto> {
    const plan = await this.repo.findById(id);
    if (!plan) throw AppError.notFound(`Plan "${id}" not found`);

    if (!plan.allow_pause) {
      throw AppError.conflict('This plan does not permit pausing (allowPause is false)');
    }
    if (plan.state !== 'open') {
      throw AppError.conflict(`Cannot pause plan currently in "${plan.state}" state`);
    }

    const updated = await this.repo.update(id, { state: 'paused' });
    return formatPlanResponse(updated!);
  }

  async resumePlan(id: string): Promise<PlanResponseDto> {
    const plan = await this.repo.findById(id);
    if (!plan) throw AppError.notFound(`Plan "${id}" not found`);

    if (plan.state !== 'paused') {
      throw AppError.conflict(`Cannot resume plan currently in "${plan.state}" state`);
    }

    const updated = await this.repo.update(id, { state: 'open' });
    return formatPlanResponse(updated!);
  }

  async closePlan(id: string): Promise<PlanResponseDto> {
    const plan = await this.repo.findById(id);
    if (!plan) throw AppError.notFound(`Plan "${id}" not found`);

    if (!plan.allow_early_close) {
      throw AppError.conflict('This plan does not permit early closure (allowEarlyClose is false)');
    }

    const updated = await this.repo.update(id, { state: 'closed' });
    return formatPlanResponse(updated!);
  }

  async renewPlan(id: string, dto: RenewPlanDto): Promise<PlanResponseDto> {
    const plan = await this.repo.findById(id);
    if (!plan) throw AppError.notFound(`Plan "${id}" not found`);

    if (!plan.allow_renew) {
      throw AppError.conflict('This plan does not permit renewal (allowRenew is false)');
    }

    const payload: any = { state: 'open' };
    if (dto.availableTo) {
      payload.available_to = dto.availableTo;
    }

    const updated = await this.repo.update(id, payload);
    return formatPlanResponse(updated!);
  }

  async getPlan(id: string): Promise<PlanResponseDto> {
    const plan = await this.repo.findById(id);
    if (!plan) throw AppError.notFound(`Plan "${id}" not found`);
    return formatPlanResponse(plan);
  }

  async listPlans(query: PlanQueryDto) {
    const { plans, total } = await this.repo.findAll(query);
    return {
      data: plans.map(formatPlanResponse),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }
}

export const planService = new PlanService();
