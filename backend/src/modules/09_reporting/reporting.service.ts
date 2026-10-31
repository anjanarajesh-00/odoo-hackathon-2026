import { getDb } from '../../config/database.js';
import { invoiceRepository } from '../06_invoices/invoice.repository.js';
import {
  DashboardSummaryQueryDto,
  RevenueTrendQueryDto,
  OverdueInvoicesQueryDto,
} from './reporting.dto.js';

export class ReportingService {
  async getSummary(query: DashboardSummaryQueryDto) {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];

    // 1. Active subscriptions count
    const activeSubsResult = await db('subscriptions')
      .where({ status: 'active' })
      .count<{ count: string | number }>('id as count')
      .first();
    const activeSubscriptions = Number(activeSubsResult?.count || 0);

    // 2. Normalised Monthly Recurring Revenue (MRR)
    // Formula: yearly / 12, monthly * 1, weekly * 4.33, daily * 30
    const activeSubsWithPlans = await db('subscriptions as s')
      .leftJoin('plans as p', 's.plan_id', 'p.id')
      .where('s.status', 'active')
      .select('s.total', 'p.billing_period');

    let mrr = 0;
    for (const sub of activeSubsWithPlans) {
      const amt = Number(sub.total);
      switch (sub.billing_period) {
        case 'yearly':
          mrr += amt / 12;
          break;
        case 'weekly':
          mrr += amt * 4.33;
          break;
        case 'daily':
          mrr += amt * 30;
          break;
        case 'monthly':
        default:
          mrr += amt;
          break;
      }
    }

    // 3. Revenue collected (from payments table)
    let paymentQuery = db('payments');
    if (query.dateFrom) paymentQuery = paymentQuery.where('date', '>=', query.dateFrom);
    if (query.dateTo) paymentQuery = paymentQuery.where('date', '<=', query.dateTo);
    const revenueResult = await paymentQuery.sum<{ sum: string | number }>('amount as sum').first();
    const revenueCollected = Number(revenueResult?.sum || 0);

    // 4. Outstanding amount (total unpaid balances)
    const outstandingResult = await db('invoices')
      .whereNot({ status: 'cancelled' })
      .where('balance', '>', 0)
      .sum<{ sum: string | number }>('balance as sum')
      .first();
    const outstandingAmount = Number(outstandingResult?.sum || 0);

    // 5. Overdue count and amount
    const overdueResult = await db('invoices')
      .where({ status: 'confirmed' })
      .where('due_date', '<', today)
      .where('balance', '>', 0)
      .select(
        db.raw('COUNT(id) as count'),
        db.raw('COALESCE(SUM(balance), 0) as amount')
      )
      .first();

    const overdueCount = Number((overdueResult as any)?.count || 0);
    const overdueAmount = Number((overdueResult as any)?.amount || 0);

    // 6. Paid and unpaid invoice counts
    const paidResult = await db('invoices')
      .where({ status: 'paid' })
      .count<{ count: string | number }>('id as count')
      .first();
    const paidInvoices = Number(paidResult?.count || 0);

    const unpaidResult = await db('invoices')
      .whereIn('status', ['draft', 'confirmed'])
      .where('balance', '>', 0)
      .count<{ count: string | number }>('id as count')
      .first();
    const unpaidInvoices = Number(unpaidResult?.count || 0);

    return {
      activeSubscriptions,
      mrr: Math.round(mrr * 100) / 100,
      revenueCollected: Math.round(revenueCollected * 100) / 100,
      outstandingAmount: Math.round(outstandingAmount * 100) / 100,
      overdueCount,
      overdueAmount: Math.round(overdueAmount * 100) / 100,
      paidInvoices,
      unpaidInvoices,
    };
  }

  async getRevenueTrend(query: RevenueTrendQueryDto) {
    const db = getDb();
    let pQuery = db('payments').select('date', 'amount');

    if (query.dateFrom) pQuery = pQuery.where('date', '>=', query.dateFrom);
    if (query.dateTo) pQuery = pQuery.where('date', '<=', query.dateTo);

    const payments = await pQuery.orderBy('date', 'asc');

    // Aggregate into period buckets
    const bucketMap = new Map<string, number>();

    for (const p of payments) {
      let key = p.date.substring(0, 7); // 'YYYY-MM'
      if (query.groupBy === 'day') {
        key = p.date; // 'YYYY-MM-DD'
      } else if (query.groupBy === 'week') {
        const d = new Date(p.date);
        const weekNum = Math.ceil((d.getDate() + 6 - d.getDay()) / 7);
        key = `${p.date.substring(0, 7)}-W${weekNum}`;
      }

      const existing = bucketMap.get(key) || 0;
      bucketMap.set(key, existing + Number(p.amount));
    }

    const data = Array.from(bucketMap.entries()).map(([period, revenue]) => ({
      period,
      revenue: Math.round(revenue * 100) / 100,
    }));

    return data;
  }

  async getSubscriptionsByStatus() {
    const db = getDb();
    const counts = (await db('subscriptions')
      .select('status')
      .count('id as count')
      .groupBy('status')) as Array<{ status: string; count: string | number }>;

    const result: Record<string, number> = {
      draft: 0,
      quotation: 0,
      confirmed: 0,
      active: 0,
      closed: 0,
    };

    for (const row of counts) {
      result[row.status] = Number(row.count);
    }

    return result;
  }

  async getOverdueInvoices(query: OverdueInvoicesQueryDto) {
    const { invoices, total } = await invoiceRepository.findAll({
      overdue: true,
      search: query.search,
      page: query.page,
      pageSize: query.pageSize,
    });

    return {
      data: invoices,
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }
}

export const reportingService = new ReportingService();
