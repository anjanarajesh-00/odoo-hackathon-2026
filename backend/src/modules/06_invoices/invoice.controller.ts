import { Request, Response, NextFunction } from 'express';
import { invoiceService } from './invoice.service.js';
import {
  createInvoiceManualSchema,
  generateInvoicesSchema,
  invoiceQuerySchema,
} from './invoice.dto.js';
import { sendSuccess, sendList } from '../../common/utils/response.js';

export class InvoiceController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = invoiceQuerySchema.parse(req.query);
      const result = await invoiceService.listInvoices(query, req.user!);
      sendList(res, result.data, result.total, result.page, result.pageSize);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await invoiceService.getInvoiceById(req.params.id, req.user!);
      sendSuccess(res, invoice, 200);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createInvoiceManualSchema.parse(req.body);
      const invoice = await invoiceService.createManualInvoice(validated);
      sendSuccess(res, invoice, 201);
    } catch (error) {
      next(error);
    }
  }

  async generate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = generateInvoicesSchema.parse(req.body);
      const result = await invoiceService.generateDueInvoices(validated);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  async confirm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await invoiceService.confirmInvoice(req.params.id);
      sendSuccess(res, invoice, 200);
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await invoiceService.cancelInvoice(req.params.id);
      sendSuccess(res, invoice, 200);
    } catch (error) {
      next(error);
    }
  }

  async send(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await invoiceService.sendInvoice(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const html = await invoiceService.getInvoicePdf(req.params.id, req.user!);
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      next(error);
    }
  }
}

export const invoiceController = new InvoiceController();
