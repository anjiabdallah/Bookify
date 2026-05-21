import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';

export interface UsersTable {
  id: number;
  email: string;
  username: string;
  password_hash: string;
  created_at: Date;
}

export interface Database {
  users: UsersTable;
}

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
