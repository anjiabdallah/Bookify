import { type Kysely } from 'kysely';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('books')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('google_books_id', 'varchar(255)', col => col.unique().notNull())
    .addColumn('title', 'varchar(255)', col => col.notNull())
    .addColumn('author', 'varchar(255)', col => col.notNull())
    .addColumn('cover_url', 'text')
    .addColumn('description', 'text')
    .addColumn('published_date', 'varchar(50)')
    .addColumn('created_at', 'timestamp', col => col.defaultTo('now()').notNull())
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('books').execute();
}
