import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('quotation_templates', (table) => {
    table.string('id', 36).primary();
    table.string('name', 255).notNullable();
    table
      .string('plan_id', 36)
      .notNullable()
      .references('id')
      .inTable('plans')
      .onDelete('RESTRICT');
    table.integer('validity_days').notNullable().defaultTo(30);
    table.text('lines').nullable(); // JSON array of line templates
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('quotation_templates');
}
