import { type Kysely } from 'kysely';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('user_books')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('user_id', 'integer', col => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('book_id', 'integer', col => col.notNull().references('books.id').onDelete('cascade'))
    .addColumn('status', 'varchar(20)', col => col.notNull())
    .addColumn('added_at', 'timestamp', col => col.defaultTo('now()').notNull())
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user_books').execute();
}
