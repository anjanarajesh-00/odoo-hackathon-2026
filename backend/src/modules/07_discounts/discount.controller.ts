import { Request, Response, NextFunction } from 'express';
import { discountService } from './discount.service.js';
import { createDiscountSchema, updateDiscountSchema, discountQuerySchema } from './discount.dto.js';
import { sendSuccess } from '../../common/utils/response.js';

export class DiscountController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = discountQuerySchema.parse(req.query);
      const discounts = await discountService.list({
        active: query.active,
        search: query.search,
      });
      sendSuccess(res, discounts);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createDiscountSchema.parse(req.body);
      const discount = await discountService.create(validated);
      sendSuccess(res, discount, 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateDiscountSchema.parse(req.body);
      const discount = await discountService.update(req.params.id, validated);
      sendSuccess(res, discount, 200);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await discountService.delete(req.params.id);
      res.status(200).json({ message: 'Discount deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const discountController = new DiscountController();
