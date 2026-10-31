import { Knex } from 'knex';
import { getDb } from '../../config/database.js';
import {
  Subscription,
  SubscriptionLine,
  SubscriptionHistory,
  SubscriptionResponseDto,
  SubscriptionLineResponseDto,
} from './subscription.model.js';

export class SubscriptionRepository {
  private get db(): Knex {
    return getDb();
  }

  async generateNextNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const countResult = await this.db('subscriptions').count<{ count: string | number }>('id as count').first();
    const nextSeq = Number(countResult?.count || 0) + 1;
    return `SUB-${year}-${String(nextSeq).padStart(5, '0')}`;
  }

  async create(
    sub: Partial<Subscription>,
    lines: Partial<SubscriptionLine>[] = [],
    creator = 'system'
  ): Promise<SubscriptionResponseDto> {
    const trx = await this.db.transaction();
    try {
      await trx('subscriptions').insert({
        ...sub,
        created_at: new Date(),
        updated_at: new Date(),
      });

      if (lines.length > 0) {
        const lineRows = lines.map((l) => ({
          ...l,
          subscription_id: sub.id,
          created_at: new Date(),
          updated_at: new Date(),
        }));
        await trx('subscription_lines').insert(lineRows);
      }

      // Record initial history
      await trx('subscription_history').insert({
        id: `sh_${Math.random().toString(36).substring(2, 10)}`,
        subscription_id: sub.id,
        from_status: 'none',
        to_status: sub.status || 'draft',
        changed_by: creator,
        reason: 'Initial creation',
        created_at: new Date(),
      });

      await trx.commit();
      return (await this.findById(sub.id!))!;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async update(
    id: string,
    sub: Partial<Subscription>,
    lines?: Partial<SubscriptionLine>[]
  ): Promise<SubscriptionResponseDto | null> {
    const trx = await this.db.transaction();
    try {
      if (Object.keys(sub).length > 0) {
        await trx('subscriptions')
          .where({ id })
          .update({
            ...sub,
            updated_at: new Date(),
          });
      }

      if (lines !== undefined) {
        await trx('subscription_lines').where({ subscription_id: id }).del();
        if (lines.length > 0) {
          const lineRows = lines.map((l) => ({
            ...l,
            subscription_id: id,
            created_at: new Date(),
            updated_at: new Date(),
          }));
          await trx('subscription_lines').insert(lineRows);
        }
      }

      await trx.commit();
      return this.findById(id);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async recordTransition(
    subscriptionId: string,
    fromStatus: string,
    toStatus: string,
    changedBy?: string,
    reason?: string
  ): Promise<void> {
    const trx = await this.db.transaction();
    try {
      await trx('subscriptions').where({ id: subscriptionId }).update({
        status: toStatus,
        updated_at: new Date(),
      });

      await trx('subscription_history').insert({
        id: `sh_${Math.random().toString(36).substring(2, 10)}`,
        subscription_id: subscriptionId,
        from_status: fromStatus,
        to_status: toStatus,
        changed_by: changedBy || null,
        reason: reason || null,
        created_at: new Date(),
      });

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async findById(id: string): Promise<SubscriptionResponseDto | null> {
    const sub = await this.db('subscriptions as s')
      .leftJoin('customers as c', 's.customer_id', 'c.id')
      .leftJoin('plans as p', 's.plan_id', 'p.id')
      .where('s.id', id)
      .select(
        's.*',
        'c.name as customer_name',
        'p.name as plan_name',
        'p.billing_period as plan_billing_period'
      )
      .first();

    if (!sub) return null;

    const rawLines = await this.db('subscription_lines as sl')
      .leftJoin('products as pr', 'sl.product_id', 'pr.id')
      .leftJoin('product_variants as pv', 'sl.variant_id', 'pv.id')
      .where('sl.subscription_id', id)
      .select(
        'sl.*',
        'pr.name as product_name',
        'pv.value as variant_value'
      );

    const taxes = await this.db('taxes');
    const taxMap = new Map(taxes.map((t) => [t.id, t]));

    const lines: SubscriptionLineResponseDto[] = rawLines.map((l) => {
      let taxIds: string[] = [];
      try {
        if (l.tax_ids) taxIds = JSON.parse(l.tax_ids);
      } catch (e) {}

      const appliedTaxes = taxIds
        .map((tId) => taxMap.get(tId))
        .filter(Boolean)
        .map((t) => ({
          id: t!.id,
          name: t!.name,
          amount: (Number(l.unit_price) * Number(l.quantity) * Number(t!.rate)) / 100,
        }));

      return {
        id: l.id,
        product: { id: l.product_id, name: l.product_name || 'Product' },
        variant: l.variant_id ? { id: l.variant_id, value: l.variant_value || '' } : null,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unit_price),
        taxes: appliedTaxes,
        discountAmount: Number(l.discount_amount),
        amount: Number(l.amount),
      };
    });

    return {
      id: sub.id,
      number: sub.number,
      status: sub.status,
      customer: { id: sub.customer_id, name: sub.customer_name || 'Customer' },
      plan: {
        id: sub.plan_id,
        name: sub.plan_name || 'Plan',
        billingPeriod: sub.plan_billing_period || 'monthly',
      },
      startDate: sub.start_date,
      expiryDate: sub.expiry_date || null,
      quotationValidUntil: sub.quotation_valid_until || null,
      nextInvoiceDate: sub.next_invoice_date,
      paymentTerms: sub.payment_terms,
      lines,
      subtotal: Number(sub.subtotal),
      taxTotal: Number(sub.tax_total),
      discountTotal: Number(sub.discount_total),
      total: Number(sub.total),
      createdAt: new Date(sub.created_at).toISOString(),
    };
  }

  async findAll(filter?: {
    status?: string;
    customerId?: string;
    planId?: string;
    expiringBefore?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ subscriptions: SubscriptionResponseDto[]; total: number }> {
    const page = filter?.page && filter.page > 0 ? filter.page : 1;
    const pageSize = filter?.pageSize && filter.pageSize > 0 ? filter.pageSize : 20;
    const offset = (page - 1) * pageSize;

    let query = this.db('subscriptions as s')
      .leftJoin('customers as c', 's.customer_id', 'c.id')
      .leftJoin('plans as p', 's.plan_id', 'p.id');

    if (filter?.status) {
      query = query.where('s.status', filter.status);
    }

    if (filter?.customerId) {
      query = query.where('s.customer_id', filter.customerId);
    }

    if (filter?.planId) {
      query = query.where('s.plan_id', filter.planId);
    }

    if (filter?.expiringBefore) {
      query = query.where('s.expiry_date', '<=', filter.expiringBefore);
    }

    if (filter?.search) {
      const term = `%${filter.search.toLowerCase()}%`;
      query = query.where((q) => {
        q.whereRaw('LOWER(s.number) LIKE ?', [term])
          .orWhereRaw('LOWER(c.name) LIKE ?', [term])
          .orWhereRaw('LOWER(p.name) LIKE ?', [term]);
      });
    }

    const countResult = await query.clone().count<{ count: string | number }>('s.id as count').first();
    const total = Number(countResult?.count || 0);

    const rows = await query.select('s.id').orderBy('s.created_at', 'desc').limit(pageSize).offset(offset);

    const subscriptions: SubscriptionResponseDto[] = [];
    for (const r of rows) {
      const sub = await this.findById(r.id);
      if (sub) subscriptions.push(sub);
    }

    return { subscriptions, total };
  }

  async getHistory(subscriptionId: string): Promise<SubscriptionHistory[]> {
    const rows = await this.db('subscription_history')
      .where({ subscription_id: subscriptionId })
      .orderBy('created_at', 'desc');

    return rows.map((r) => ({
      ...r,
      created_at: new Date(r.created_at),
    }));
  }
}

export const subscriptionRepository = new SubscriptionRepository();
