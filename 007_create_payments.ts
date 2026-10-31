import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('payments', (table) => {
    table.string('id', 36).primary();
    table
      .string('invoice_id', 36)
      .notNullable()
      .references('id')
      .inTable('invoices')
      .onDelete('RESTRICT')
      .index();
    table.string('method', 50).notNullable(); // 'cash', 'card', 'bank_transfer', 'upi', 'cheque'
    table.decimal('amount', 12, 2).notNullable();
    table.date('date').notNullable();
    table.text('note').nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('payments');
}
