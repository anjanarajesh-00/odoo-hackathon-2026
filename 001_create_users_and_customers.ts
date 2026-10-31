import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.string('id', 36).primary();
    table.string('name', 255).notNullable();
    table.string('email', 255).notNullable().unique().index();
    table.string('password_hash', 255).nullable();
    table.string('role', 20).notNullable().defaultTo('customer'); // 'admin', 'staff', 'customer'
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('customers', (table) => {
    table.string('id', 36).primary();
    table
      .string('user_id', 36)
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL')
      .index();
    table.string('name', 255).notNullable();
    table.string('company', 255).nullable();
    table.string('email', 255).notNullable().index();
    table.string('phone', 50).nullable();
    table.text('address').nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('customers');
  await knex.schema.dropTableIfExists('users');
}
