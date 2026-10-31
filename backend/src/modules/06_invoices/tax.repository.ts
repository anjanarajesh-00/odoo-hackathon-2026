import { Knex } from 'knex';
import { getDb } from '../../config/database.js';
import { Tax } from './tax.model.js';

export class TaxRepository {
  private get db(): Knex {
    return getDb();
  }

  async create(tax: Partial<Tax>): Promise<Tax> {
    await this.db('taxes').insert({
      ...tax,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return (await this.findById(tax.id!))!;
  }

  async update(id: string, tax: Partial<Tax>): Promise<Tax | null> {
    await this.db('taxes')
      .where({ id })
      .update({
        ...tax,
        updated_at: new Date(),
      });
    return this.findById(id);
  }

  async findById(id: string): Promise<Tax | null> {
    const row = await this.db('taxes').where({ id }).first();
    return row || null;
  }

  async findAll(): Promise<Tax[]> {
    return this.db('taxes').where({ active: true }).orderBy('rate', 'asc');
  }

  async delete(id: string): Promise<boolean> {
    const count = await this.db('taxes').where({ id }).update({ active: false });
    return count > 0;
  }
}

export const taxRepository = new TaxRepository();
