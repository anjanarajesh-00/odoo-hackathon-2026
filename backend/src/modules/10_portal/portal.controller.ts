import { Request, Response, NextFunction } from 'express';
import { getDb } from '../../config/database.js';
import { userRepository } from '../02_users/user.repository.js';
import { sendSuccess } from '../../common/utils/response.js';

export class PortalController {
  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let customerId = req.user?.customerId;
      if (!customerId && req.user?.id) {
        const customer = await userRepository.findCustomerByUserId(req.user.id);
        customerId = customer?.id;
      }

      if (!customerId) {
        sendSuccess(res, {
          activeSubscriptions: 0,
          outstandingAmount: 0,
          overdueCount: 0,
          nextInvoiceDate: null,
          nextInvoiceAmount: 0,
        });
        return;
      }

      const db = getDb();
      const today = new Date().toISOString().split('T')[0];

      // 1. Active subscriptions and nearest next billing cycle
      const activeSubs = await db('subscriptions')
        .where({ customer_id: customerId, status: 'active' })
        .select('id', 'total', 'next_invoice_date')
        .orderBy('next_invoice_date', 'asc');

      const activeSubscriptions = activeSubs.length;
      let nextInvoiceDate: string | null = null;
      let nextInvoiceAmount = 0;

      if (activeSubs.length > 0) {
        const nearest = activeSubs[0];
        try {
          const d = new Date(nearest.next_invoice_date);
          nextInvoiceDate = !isNaN(d.getTime())
            ? d.toISOString().split('T')[0]
            : String(nearest.next_invoice_date).split('T')[0];
        } catch {
          nextInvoiceDate = String(nearest.next_invoice_date).split('T')[0];
        }
        nextInvoiceAmount = Number(nearest.total || 0);
      }

      // 2. Outstanding amount and overdue count on confirmed invoices only (draft never count)
      const invSummary = await db('invoices')
        .where({ customer_id: customerId, status: 'confirmed' })
        .where('balance', '>', 0)
        .select(
          db.raw('COALESCE(SUM(balance), 0) as outstanding'),
          db.raw(`COUNT(CASE WHEN due_date < ? THEN 1 END) as overdue_count`, [today])
        )
        .first();

      const outstandingAmount = Math.round(Number((invSummary as any)?.outstanding || 0) * 100) / 100;
      const overdueCount = Number((invSummary as any)?.overdue_count || 0);

      sendSuccess(res, {
        activeSubscriptions,
        outstandingAmount,
        overdueCount,
        nextInvoiceDate,
        nextInvoiceAmount,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const portalController = new PortalController();
