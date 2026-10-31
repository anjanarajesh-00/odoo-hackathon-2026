import { Knex } from 'knex';
import { getDb } from '../../config/database.js';
import { Discount } from './discount.model.js';

export class DiscountRepository {
  private get db(): Knex {
    return getDb();
  }

  async create(discount: Partial<Discount>): Promise<Discount> {
    await this.db('discounts').insert({
      ...discount,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return (await this.findById(discount.id!))!;
  }

  async update(id: string, discount: Partial<Discount>): Promise<Discount | null> {
    await this.db('discounts')
      .where({ id })
      .update({
        ...discount,
        updated_at: new Date(),
      });
    return this.findById(id);
  }

  async incrementUsage(id: string): Promise<void> {
    await this.db('discounts').where({ id }).increment('used_count', 1);
  }

  async findById(id: string): Promise<Discount | null> {
    const row = await this.db('discounts').where({ id }).first();
    return row || null;
  }

  async findAll(filter?: { active?: boolean; search?: string }): Promise<Discount[]> {
    let query = this.db('discounts');

    if (filter?.active !== undefined) {
      query = query.where({ active: filter.active });
    }

    if (filter?.search) {
      const term = `%${filter.search.toLowerCase()}%`;
      query = query.whereRaw('LOWER(name) LIKE ?', [term]);
    }

    return query.orderBy('created_at', 'desc');
  }

  async delete(id: string): Promise<boolean> {
    const count = await this.db('discounts').where({ id }).update({ active: false });
    return count > 0;
  }
}

export const discountRepository = new DiscountRepository();
