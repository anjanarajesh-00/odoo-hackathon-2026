import { Knex } from 'knex';
import { getDb } from '../../config/database.js';
import { Payment } from './payment.model.js';
import { InvoiceResponseDto } from '../06_invoices/invoice.model.js';
import { invoiceRepository } from '../06_invoices/invoice.repository.js';

export class PaymentRepository {
  private get db(): Knex {
    return getDb();
  }

  async recordPayment(
    paymentData: Partial<Payment>,
    newAmountPaid: number,
    newBalance: number,
    newStatus: string
  ): Promise<{ payment: Payment; invoice: InvoiceResponseDto }> {
    const trx = await this.db.transaction();
    try {
      await trx('payments').insert({
        ...paymentData,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await trx('invoices')
        .where({ id: paymentData.invoice_id })
        .update({
          amount_paid: newAmountPaid,
          balance: newBalance,
          status: newStatus,
          updated_at: new Date(),
        });

      await trx.commit();

      const created = await this.findById(paymentData.id!);
      const invoice = await invoiceRepository.findById(paymentData.invoice_id!);

      return { payment: created!, invoice: invoice! };
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async findById(id: string): Promise<Payment | null> {
    const row = await this.db('payments').where({ id }).first();
    return row || null;
  }

  async findAll(filter?: {
    invoiceId?: string;
    customerId?: string;
    method?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ payments: any[]; total: number; totalAmount: number }> {
    const page = filter?.page && filter.page > 0 ? filter.page : 1;
    const pageSize = filter?.pageSize && filter.pageSize > 0 ? filter.pageSize : 20;
    const offset = (page - 1) * pageSize;

    let query = this.db('payments as p')
      .leftJoin('invoices as i', 'p.invoice_id', 'i.id')
      .leftJoin('customers as c', 'i.customer_id', 'c.id');

    if (filter?.invoiceId) {
      query = query.where('p.invoice_id', filter.invoiceId);
    }

    if (filter?.customerId) {
      query = query.where('i.customer_id', filter.customerId);
    }

    if (filter?.method) {
      query = query.where('p.method', filter.method);
    }

    if (filter?.dateFrom) {
      query = query.where('p.date', '>=', filter.dateFrom);
    }

    if (filter?.dateTo) {
      query = query.where('p.date', '<=', filter.dateTo);
    }

    if (filter?.search) {
      const s = `%${filter.search}%`;
      query = query.where((qb) => {
        qb.where('i.number', 'like', s).orWhere('c.name', 'like', s);
      });
    }

    const summaryResult = await query
      .clone()
      .select(
        this.db.raw('COUNT(p.id) as count'),
        this.db.raw('COALESCE(SUM(p.amount), 0) as total_amount')
      )
      .first();

    const total = Number((summaryResult as any)?.count || 0);
    const totalAmount = Number((summaryResult as any)?.total_amount || 0);

    const payments = await query
      .select(
        'p.*',
        'i.number as invoice_number',
        'i.customer_id as invoice_customer_id',
        'c.id as customer_id',
        'c.name as customer_name'
      )
      .orderBy('p.date', 'desc')
      .limit(pageSize)
      .offset(offset);

    return { payments, total, totalAmount };
  }
}

export const paymentRepository = new PaymentRepository();
