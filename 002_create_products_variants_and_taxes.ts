import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('products', (table) => {
    table.string('id', 36).primary();
    table.string('name', 255).notNullable();
    table.string('type', 50).notNullable().defaultTo('service'); // 'service', 'goods'
    table.decimal('sales_price', 12, 2).notNullable().defaultTo(0.0);
    table.decimal('cost_price', 12, 2).notNullable().defaultTo(0.0);
    table.text('notes').nullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('product_variants', (table) => {
    table.string('id', 36).primary();
    table
      .string('product_id', 36)
      .notNullable()
      .references('id')
      .inTable('products')
      .onDelete('CASCADE');
    table.string('attribute', 100).notNullable(); // e.g. 'Brand'
    table.string('value', 100).notNullable(); // e.g. 'Odoo'
    table.decimal('extra_price', 12, 2).notNullable().defaultTo(0.0); // e.g. 560.00
    table.timestamps(true, true);
  });

  await knex.schema.createTable('taxes', (table) => {
    table.string('id', 36).primary();
    table.string('name', 100).notNullable(); // e.g. 'GST 18%'
    table.string('type', 50).notNullable().defaultTo('percentage');
    table.decimal('rate', 5, 2).notNullable(); // e.g. 18.00
    table.boolean('active').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('taxes');
  await knex.schema.dropTableIfExists('product_variants');
  await knex.schema.dropTableIfExists('products');
}
