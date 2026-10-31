import { Knex } from 'knex';
import { getDb } from '../../config/database.js';
import { Invoice, InvoiceLine, InvoiceResponseDto } from './invoice.model.js';

export class InvoiceRepository {
  private get db(): Knex {
    return getDb();
  }

  async generateNextNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const countResult = await this.db('invoices').count<{ count: string | number }>('id as count').first();
    const nextSeq = Number(countResult?.count || 0) + 1;
    return `INV-${year}-${String(nextSeq).padStart(5, '0')}`;
  }

  async findExistingForPeriod(
    subscriptionId: string,
    periodStart: string
  ): Promise<Invoice | null> {
    const row = await this.db('invoices')
      .where({ subscription_id: subscriptionId, period_start: periodStart })
      .first();
    return row || null;
  }

  async create(
    inv: Partial<Invoice>,
    lines: Partial<InvoiceLine>[] = [],
    appliedDiscountId?: string
  ): Promise<InvoiceResponseDto> {
    const trx = await this.db.transaction();
    try {
      await trx('invoices').insert({
        ...inv,
        created_at: new Date(),
        updated_at: new Date(),
      });

      if (lines.length > 0) {
        const lineRows = lines.map((l) => ({
          ...l,
          invoice_id: inv.id,
          created_at: new Date(),
          updated_at: new Date(),
        }));
        await trx('invoice_lines').insert(lineRows);
      }

      if (appliedDiscountId) {
        await trx('discounts')
          .where({ id: appliedDiscountId })
          .increment('used_count', 1);
      }

      await trx.commit();
      return (await this.findById(inv.id!))!;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async findById(id: string): Promise<InvoiceResponseDto | null> {
    const inv = await this.db('invoices as i')
      .leftJoin('customers as c', 'i.customer_id', 'c.id')
      .leftJoin('subscriptions as s', 'i.subscription_id', 's.id')
      .where('i.id', id)
      .select(
        'i.*',
        'c.name as customer_name',
        's.number as subscription_number'
      )
      .first();

    if (!inv) return null;

    const lines = await this.db('invoice_lines').where({ invoice_id: id });
    const payments = await this.db('payments').where({ invoice_id: id }).orderBy('date', 'desc');

    const today = new Date().toISOString().split('T')[0];
    const isOverdue =
      inv.status === 'confirmed' &&
      inv.due_date < today &&
      Number(inv.balance) > 0;

    return {
      id: inv.id,
      number: inv.number,
      status: inv.status,
      isOverdue,
      customer: { id: inv.customer_id, name: inv.customer_name || 'Customer' },
      subscription: inv.subscription_id
        ? { id: inv.subscription_id, number: inv.subscription_number || 'SUB' }
        : null,
      periodStart: inv.period_start,
      periodEnd: inv.period_end,
      invoiceDate: inv.invoice_date,
      dueDate: inv.due_date,
      lines: lines.map((l) => ({
        description: l.description,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unit_price),
        taxAmount: Number(l.tax_amount),
        discountAmount: Number(l.discount_amount),
        amount: Number(l.amount),
      })),
      subtotal: Number(inv.subtotal),
      taxTotal: Number(inv.tax_total),
      discountTotal: Number(inv.discount_total),
      total: Number(inv.total),
      amountPaid: Number(inv.amount_paid),
      balance: Number(inv.balance),
      payments: payments.map((p) => ({
        id: p.id,
        method: p.method,
        amount: Number(p.amount),
        date: p.date,
        note: p.note,
      })),
    };
  }

  async update(id: string, inv: Partial<Invoice>): Promise<InvoiceResponseDto | null> {
    await this.db('invoices')
      .where({ id })
      .update({
        ...inv,
        updated_at: new Date(),
      });
    return this.findById(id);
  }

  async findAll(filter?: {
    status?: string;
    overdue?: boolean;
    customerId?: string;
    subscriptionId?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ invoices: InvoiceResponseDto[]; total: number }> {
    const page = filter?.page && filter.page > 0 ? filter.page : 1;
    const pageSize = filter?.pageSize && filter.pageSize > 0 ? filter.pageSize : 20;
    const offset = (page - 1) * pageSize;
    const today = new Date().toISOString().split('T')[0];

    let query = this.db('invoices as i')
      .leftJoin('customers as c', 'i.customer_id', 'c.id')
      .leftJoin('subscriptions as s', 'i.subscription_id', 's.id');

    if (filter?.status) {
      query = query.where('i.status', filter.status);
    }

    if (filter?.overdue !== undefined) {
      if (filter.overdue) {
        query = query
          .where('i.status', 'confirmed')
          .where('i.due_date', '<', today)
          .where('i.balance', '>', 0);
      } else {
        query = query.where((q) => {
          q.where('i.status', '!=', 'confirmed')
            .orWhere('i.due_date', '>=', today)
            .orWhere('i.balance', '<=', 0);
        });
      }
    }

    if (filter?.customerId) {
      query = query.where('i.customer_id', filter.customerId);
    }

    if (filter?.subscriptionId) {
      query = query.where('i.subscription_id', filter.subscriptionId);
    }

    if (filter?.dateFrom) {
      query = query.where('i.invoice_date', '>=', filter.dateFrom);
    }

    if (filter?.dateTo) {
      query = query.where('i.invoice_date', '<=', filter.dateTo);
    }

    if (filter?.search) {
      const term = `%${filter.search.toLowerCase()}%`;
      query = query.where((q) => {
        q.whereRaw('LOWER(i.number) LIKE ?', [term])
          .orWhereRaw('LOWER(c.name) LIKE ?', [term]);
      });
    }

    const countResult = await query.clone().count<{ count: string | number }>('i.id as count').first();
    const total = Number(countResult?.count || 0);

    const rows = await query.select('i.id').orderBy('i.invoice_date', 'desc').limit(pageSize).offset(offset);

    const invoices: InvoiceResponseDto[] = [];
    for (const r of rows) {
      const inv = await this.findById(r.id);
      if (inv) invoices.push(inv);
    }

    return { invoices, total };
  }
}

export const invoiceRepository = new InvoiceRepository();
