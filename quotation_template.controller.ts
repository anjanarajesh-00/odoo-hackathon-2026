import { Request, Response, NextFunction } from 'express';
import { quotationTemplateService } from './quotation_template.service.js';
import { createTemplateSchema, updateTemplateSchema } from './quotation_template.dto.js';
import { sendSuccess } from '../../common/utils/response.js';

export class QuotationTemplateController {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const templates = await quotationTemplateService.list();
      sendSuccess(res, templates);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const template = await quotationTemplateService.getById(req.params.id);
      sendSuccess(res, template);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createTemplateSchema.parse(req.body);
      const template = await quotationTemplateService.create(validated);
      sendSuccess(res, template, 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateTemplateSchema.parse(req.body);
      const template = await quotationTemplateService.update(req.params.id, validated);
      sendSuccess(res, template, 200);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await quotationTemplateService.delete(req.params.id);
      res.status(200).json({ message: 'Quotation template deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const quotationTemplateController = new QuotationTemplateController();
