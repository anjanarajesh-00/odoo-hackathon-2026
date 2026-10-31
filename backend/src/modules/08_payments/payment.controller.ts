import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service.js';
import { recordPaymentSchema, paymentQuerySchema } from './payment.dto.js';
import { sendSuccess, sendList } from '../../common/utils/response.js';

export class PaymentController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = paymentQuerySchema.parse(req.query);
      const result = await paymentService.listPayments(query, req.user!);
      res.status(200).json({
        data: result.data,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        summary: result.summary,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payment = await paymentService.getPayment(req.params.id);
      sendSuccess(res, payment, 200);
    } catch (error) {
      next(error);
    }
  }

  async recordPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = recordPaymentSchema.parse(req.body);
      const result = await paymentService.recordPayment(req.params.id, validated);
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
