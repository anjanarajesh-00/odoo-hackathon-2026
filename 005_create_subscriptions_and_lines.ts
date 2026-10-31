import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('subscriptions', (table) => {
    table.string('id', 36).primary();
    table.string('number', 50).notNullable().unique().index(); // e.g. 'SUB-2026-00042'
    table.string('status', 30).notNullable().defaultTo('draft').index(); // 'draft', 'quotation', 'confirmed', 'active', 'closed'
    table
      .string('customer_id', 36)
      .notNullable()
      .references('id')
      .inTable('customers')
      .onDelete('RESTRICT')
      .index();
    table
      .string('plan_id', 36)
      .notNullable()
      .references('id')
      .inTable('plans')
      .onDelete('RESTRICT');
    table.date('start_date').notNullable();
    table.date('expiry_date').nullable();
    table.date('quotation_valid_until').nullable();
    table.date('next_invoice_date').notNullable().index();
    table.string('payment_terms', 50).notNullable().defaultTo('Net 15');
    table.decimal('subtotal', 12, 2).notNullable().defaultTo(0.0);
    table.decimal('tax_total', 12, 2).notNullable().defaultTo(0.0);
    table.decimal('discount_total', 12, 2).notNullable().defaultTo(0.0);
    table.decimal('total', 12, 2).notNullable().defaultTo(0.0);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('subscription_lines', (table) => {
    table.string('id', 36).primary();
    table
      .string('subscription_id', 36)
      .notNullable()
      .references('id')
      .inTable('subscriptions')
      .onDelete('CASCADE')
      .index();
    table
      .string('product_id', 36)
      .notNullable()
      .references('id')
      .inTable('products')
      .onDelete('RESTRICT');
    table
      .string('variant_id', 36)
      .nullable()
      .references('id')
      .inTable('product_variants')
      .onDelete('SET NULL');
    table.integer('quantity').notNullable().defaultTo(1);
    table.decimal('unit_price', 12, 2).notNullable();
    table.text('tax_ids').nullable(); // JSON array of tax IDs
    table.decimal('tax_amount', 12, 2).notNullable().defaultTo(0.0);
    table.decimal('discount_amount', 12, 2).notNullable().defaultTo(0.0);
    table.decimal('amount', 12, 2).notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('subscription_history', (table) => {
    table.string('id', 36).primary();
    table
      .string('subscription_id', 36)
      .notNullable()
      .references('id')
      .inTable('subscriptions')
      .onDelete('CASCADE')
      .index();
    table.string('from_status', 30).notNullable();
    table.string('to_status', 30).notNullable();
    table.string('changed_by', 255).nullable();
    table.text('reason').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('subscription_history');
  await knex.schema.dropTableIfExists('subscription_lines');
  await knex.schema.dropTableIfExists('subscriptions');
}
