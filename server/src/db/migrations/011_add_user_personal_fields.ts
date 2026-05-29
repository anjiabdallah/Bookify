import { type Kysely } from 'kysely';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('users')
    .addColumn('first_name', 'text')
    .addColumn('last_name', 'text')
    .addColumn('dob', 'text')
    .addColumn('gender', 'text')
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('users')
    .dropColumn('first_name')
    .dropColumn('last_name')
    .dropColumn('dob')
    .dropColumn('gender')
    .execute();
}
