import { type Kysely } from 'kysely';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('users')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('email', 'varchar(255)', col => col.unique().notNull())
    .addColumn('username', 'varchar(100)', col => col.unique().notNull())
    .addColumn('password_hash', 'text', col => col.notNull())
    .addColumn('created_at', 'timestamp', col => col.defaultTo('now()').notNull())
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('users').execute();
}
