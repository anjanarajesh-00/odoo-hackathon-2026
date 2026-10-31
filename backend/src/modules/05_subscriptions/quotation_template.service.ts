import crypto from 'node:crypto';
import { quotationTemplateRepository } from './quotation_template.repository.js';
import { CreateTemplateDto, UpdateTemplateDto } from './quotation_template.dto.js';
import {
  QuotationTemplateResponseDto,
  formatTemplateResponse,
} from './quotation_template.model.js';
import { planRepository } from '../04_plans/plan.repository.js';
import { AppError } from '../../common/errors/AppError.js';

export class QuotationTemplateService {
  async create(dto: CreateTemplateDto): Promise<QuotationTemplateResponseDto> {
    const plan = await planRepository.findById(dto.planId);
    if (!plan) {
      throw AppError.notFound(`Plan "${dto.planId}" not found`);
    }

    const template = await quotationTemplateRepository.create({
      id: `qt_${crypto.randomUUID().slice(0, 8)}`,
      name: dto.name.trim(),
      plan_id: dto.planId,
      validity_days: dto.validityDays,
      lines: JSON.stringify(dto.lines || []),
    });

    return formatTemplateResponse(template);
  }

  async update(id: string, dto: UpdateTemplateDto): Promise<QuotationTemplateResponseDto> {
    const existing = await quotationTemplateRepository.findById(id);
    if (!existing) {
      throw AppError.notFound(`Quotation template "${id}" not found`);
    }

    if (dto.planId) {
      const plan = await planRepository.findById(dto.planId);
      if (!plan) throw AppError.notFound(`Plan "${dto.planId}" not found`);
    }

    const payload: any = {};
    if (dto.name !== undefined) payload.name = dto.name.trim();
    if (dto.planId !== undefined) payload.plan_id = dto.planId;
    if (dto.validityDays !== undefined) payload.validity_days = dto.validityDays;
    if (dto.lines !== undefined) payload.lines = JSON.stringify(dto.lines);

    const updated = await quotationTemplateRepository.update(id, payload);
    return formatTemplateResponse(updated!);
  }

  async getById(id: string): Promise<QuotationTemplateResponseDto> {
    const template = await quotationTemplateRepository.findById(id);
    if (!template) {
      throw AppError.notFound(`Quotation template "${id}" not found`);
    }
    return formatTemplateResponse(template);
  }

  async list(): Promise<QuotationTemplateResponseDto[]> {
    const templates = await quotationTemplateRepository.findAll();
    return templates.map(formatTemplateResponse);
  }

  async delete(id: string): Promise<void> {
    const existing = await quotationTemplateRepository.findById(id);
    if (!existing) {
      throw AppError.notFound(`Quotation template "${id}" not found`);
    }
    await quotationTemplateRepository.delete(id);
  }
}

export const quotationTemplateService = new QuotationTemplateService();
