import crypto from 'node:crypto';
import { taxRepository } from './tax.repository.js';
import { CreateTaxDto, UpdateTaxDto } from './tax.dto.js';
import { TaxResponseDto, formatTaxResponse } from './tax.model.js';
import { AppError } from '../../common/errors/AppError.js';

export class TaxService {
  async create(dto: CreateTaxDto): Promise<TaxResponseDto> {
    const tax = await taxRepository.create({
      id: `t_${crypto.randomUUID().slice(0, 8)}`,
      name: dto.name.trim(),
      type: dto.type || 'percentage',
      rate: dto.rate,
      active: dto.active,
    });
    return formatTaxResponse(tax);
  }

  async update(id: string, dto: UpdateTaxDto): Promise<TaxResponseDto> {
    const existing = await taxRepository.findById(id);
    if (!existing) throw AppError.notFound(`Tax rule "${id}" not found`);

    const updated = await taxRepository.update(id, dto);
    return formatTaxResponse(updated!);
  }

  async list(): Promise<TaxResponseDto[]> {
    const taxes = await taxRepository.findAll();
    return taxes.map(formatTaxResponse);
  }

  async delete(id: string): Promise<void> {
    const existing = await taxRepository.findById(id);
    if (!existing) throw AppError.notFound(`Tax rule "${id}" not found`);
    await taxRepository.delete(id);
  }
}

export const taxService = new TaxService();
