import { type Kysely } from 'kysely';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('user_books')
    .addColumn('favorite', 'boolean')
    .addColumn('physical_copy', 'boolean')
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('user_books')
    .dropColumn('favorite')
    .dropColumn('physical_copy')
    .execute();
}
