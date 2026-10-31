import { Request, Response, NextFunction } from 'express';
import { taxService } from './tax.service.js';
import { createTaxSchema, updateTaxSchema } from './tax.dto.js';
import { sendSuccess } from '../../common/utils/response.js';

export class TaxController {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taxes = await taxService.list();
      sendSuccess(res, taxes);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createTaxSchema.parse(req.body);
      const tax = await taxService.create(validated);
      sendSuccess(res, tax, 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateTaxSchema.parse(req.body);
      const tax = await taxService.update(req.params.id, validated);
      sendSuccess(res, tax, 200);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await taxService.delete(req.params.id);
      res.status(200).json({ message: 'Tax rule deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const taxController = new TaxController();
