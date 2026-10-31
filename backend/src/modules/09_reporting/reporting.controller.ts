import { Request, Response, NextFunction } from 'express';
import { reportingService } from './reporting.service.js';
import {
  dashboardSummaryQuerySchema,
  revenueTrendQuerySchema,
  overdueInvoicesQuerySchema,
} from './reporting.dto.js';
import { sendSuccess, sendList } from '../../common/utils/response.js';

export class ReportingController {
  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = dashboardSummaryQuerySchema.parse(req.query);
      const summary = await reportingService.getSummary(query);
      sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  }

  async getRevenueTrend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = revenueTrendQuerySchema.parse(req.query);
      const trend = await reportingService.getRevenueTrend(query);
      sendSuccess(res, trend);
    } catch (error) {
      next(error);
    }
  }

  async getSubscriptionsByStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const statusCounts = await reportingService.getSubscriptionsByStatus();
      sendSuccess(res, statusCounts);
    } catch (error) {
      next(error);
    }
  }

  async getOverdueInvoices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = overdueInvoicesQuerySchema.parse(req.query);
      const result = await reportingService.getOverdueInvoices(query);
      sendList(res, result.data, result.total, result.page, result.pageSize);
    } catch (error) {
      next(error);
    }
  }

  async getInsights(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const insights = await reportingService.getInsights();
      sendSuccess(res, insights);
    } catch (error) {
      next(error);
    }
  }
}

export const reportingController = new ReportingController();
