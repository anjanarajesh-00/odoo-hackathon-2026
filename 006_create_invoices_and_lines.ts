import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('invoices', (table) => {
    table.string('id', 36).primary();
    table.string('number', 50).notNullable().unique().index(); // e.g. 'INV-2026-00310'
    table.string('status', 30).notNullable().defaultTo('draft').index(); // 'draft', 'confirmed', 'paid', 'cancelled'
    table
      .string('customer_id', 36)
      .notNullable()
      .references('id')
      .inTable('customers')
      .onDelete('RESTRICT')
      .index();
    table
      .string('subscription_id', 36)
      .nullable()
      .references('id')
      .inTable('subscriptions')
      .onDelete('SET NULL')
      .index();
    table.date('period_start').notNullable();
    table.date('period_end').notNullable();
    table.date('invoice_date').notNullable();
    table.date('due_date').notNullable().index();
    table.decimal('subtotal', 12, 2).notNullable().defaultTo(0.0);
    table.decimal('tax_total', 12, 2).notNullable().defaultTo(0.0);
    table.decimal('discount_total', 12, 2).notNullable().defaultTo(0.0);
    table.decimal('total', 12, 2).notNullable().defaultTo(0.0);
    table.decimal('amount_paid', 12, 2).notNullable().defaultTo(0.0);
    table.decimal('balance', 12, 2).notNullable().defaultTo(0.0);
    table.timestamps(true, true);

    // Idempotency: Never bill the same subscription and billing period twice
    table.unique(['subscription_id', 'period_start']);
  });

  await knex.schema.createTable('invoice_lines', (table) => {
    table.string('id', 36).primary();
    table
      .string('invoice_id', 36)
      .notNullable()
      .references('id')
      .inTable('invoices')
      .onDelete('CASCADE')
      .index();
    table.string('product_id', 36).nullable();
    table.string('variant_id', 36).nullable();
    table.string('description', 255).notNullable();
    table.integer('quantity').notNullable().defaultTo(1);
    table.decimal('unit_price', 12, 2).notNullable();
    table.decimal('tax_amount', 12, 2).notNullable().defaultTo(0.0);
    table.decimal('discount_amount', 12, 2).notNullable().defaultTo(0.0);
    table.decimal('amount', 12, 2).notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('invoice_lines');
  await knex.schema.dropTableIfExists('invoices');
}
