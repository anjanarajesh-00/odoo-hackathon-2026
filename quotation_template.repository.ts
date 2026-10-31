import { Knex } from 'knex';
import { getDb } from '../../config/database.js';
import { QuotationTemplate } from './quotation_template.model.js';

export class QuotationTemplateRepository {
  private get db(): Knex {
    return getDb();
  }

  async create(template: Partial<QuotationTemplate>): Promise<QuotationTemplate> {
    await this.db('quotation_templates').insert({
      ...template,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return (await this.findById(template.id!))!;
  }

  async update(id: string, template: Partial<QuotationTemplate>): Promise<QuotationTemplate | null> {
    await this.db('quotation_templates')
      .where({ id })
      .update({
        ...template,
        updated_at: new Date(),
      });
    return this.findById(id);
  }

  async findById(id: string): Promise<QuotationTemplate | null> {
    const row = await this.db('quotation_templates').where({ id }).first();
    return row || null;
  }

  async findAll(): Promise<QuotationTemplate[]> {
    return this.db('quotation_templates').orderBy('created_at', 'desc');
  }

  async delete(id: string): Promise<boolean> {
    const count = await this.db('quotation_templates').where({ id }).del();
    return count > 0;
  }
}

export const quotationTemplateRepository = new QuotationTemplateRepository();
