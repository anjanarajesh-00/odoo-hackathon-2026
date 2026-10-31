import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('plans', (table) => {
    table.string('id', 36).primary();
    table.string('name', 255).notNullable();
    table.decimal('price', 12, 2).notNullable();
    table.string('billing_period', 20).notNullable(); // 'daily', 'weekly', 'monthly', 'yearly'
    table.integer('min_quantity').notNullable().defaultTo(1);
    table.date('available_from').notNullable();
    table.date('available_to').nullable();
    table.boolean('auto_close').notNullable().defaultTo(true);
    table.boolean('allow_early_close').notNullable().defaultTo(true);
    table.boolean('allow_pause').notNullable().defaultTo(true);
    table.boolean('allow_renew').notNullable().defaultTo(true);
    table.string('state', 20).notNullable().defaultTo('open'); // 'open', 'paused', 'closed'
    table.timestamps(true, true);
  });

  await knex.schema.createTable('discounts', (table) => {
    table.string('id', 36).primary();
    table.string('name', 255).notNullable();
    table.string('type', 20).notNullable(); // 'fixed', 'percentage'
    table.decimal('value', 12, 2).notNullable();
    table.decimal('min_purchase', 12, 2).notNullable().defaultTo(0.0);
    table.integer('min_quantity').notNullable().defaultTo(0);
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.integer('usage_limit').notNullable().defaultTo(0);
    table.integer('used_count').notNullable().defaultTo(0);
    table.string('applies_to', 30).notNullable().defaultTo('product'); // 'product', 'subscription'
    table.text('product_ids').nullable(); // JSON array of string IDs
    table.text('subscription_ids').nullable(); // JSON array of string IDs
    table.boolean('active').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('discounts');
  await knex.schema.dropTableIfExists('plans');
}
