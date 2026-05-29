import { type Kysely, sql } from 'kysely';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('user_book_finish_dates')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('user_book_id', 'integer', col => col.notNull())
    .addColumn('finished_at', 'date', col => col.notNull())
    .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`))
    .addForeignKeyConstraint('user_book_finish_dates_user_book_id_fkey', ['user_book_id'], 'user_books', ['id'])
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .dropTable('user_book_finish_dates')
    .execute();
}
