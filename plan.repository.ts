import { Knex } from 'knex';
import { getDb } from '../../config/database.js';
import { Plan } from './plan.model.js';

export interface IPlanRepository {
  create(plan: Partial<Plan>): Promise<Plan>;
  update(id: string, plan: Partial<Plan>): Promise<Plan | null>;
  findById(id: string): Promise<Plan | null>;
  findAll(filter?: {
    state?: string;
    billingPeriod?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ plans: Plan[]; total: number }>;
}

export class KnexPlanRepository implements IPlanRepository {
  private get db(): Knex {
    return getDb();
  }

  async create(plan: Partial<Plan>): Promise<Plan> {
    await this.db('plans').insert({
      ...plan,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return (await this.findById(plan.id!))!;
  }

  async update(id: string, plan: Partial<Plan>): Promise<Plan | null> {
    await this.db('plans')
      .where({ id })
      .update({
        ...plan,
        updated_at: new Date(),
      });
    return this.findById(id);
  }

  async findById(id: string): Promise<Plan | null> {
    const row = await this.db('plans').where({ id }).first();
    return row || null;
  }

  async findAll(filter?: {
    state?: string;
    billingPeriod?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ plans: Plan[]; total: number }> {
    const page = filter?.page && filter.page > 0 ? filter.page : 1;
    const pageSize = filter?.pageSize && filter.pageSize > 0 ? filter.pageSize : 20;
    const offset = (page - 1) * pageSize;

    let query = this.db('plans');

    if (filter?.state) {
      query = query.where({ state: filter.state });
    }

    if (filter?.billingPeriod) {
      query = query.where({ billing_period: filter.billingPeriod });
    }

    if (filter?.search) {
      const term = `%${filter.search.toLowerCase()}%`;
      query = query.whereRaw('LOWER(name) LIKE ?', [term]);
    }

    const countResult = await query.clone().count<{ count: string | number }>('id as count').first();
    const total = Number(countResult?.count || 0);

    const plans = await query
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(pageSize)
      .offset(offset);

    return { plans, total };
  }
}

export const planRepository = new KnexPlanRepository();
