import { type Kysely } from 'kysely';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('users')
    // Columns are nullable by default when no notNull() modifier is provided.
    .addColumn('age', 'integer')
    .addColumn('bio', 'text')
    .addColumn('favorite_categories', 'text')
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('users')
    .dropColumn('age')
    .dropColumn('bio')
    .dropColumn('favorite_categories')
    .execute();
}
