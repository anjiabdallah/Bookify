import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';

export interface UsersTable {
  id?: number;
  email: string;
  username: string;
  password_hash: string;
  age?: number | null;
  bio?: string | null;
  favorite_categories?: string | null;
  created_at?: Date;
}

export interface BooksTable {
  id?: number;
  google_books_id: string;
  title: string;
  author: string;
  cover_url?: string | null;
  description?: string | null;
  published_date?: string | null;
  created_at?: Date;
}

export interface UserBooksTable {
  id?: number;
  user_id: number;
  book_id: number;
  status: 'reading' | 'want_to_read' | 'read' | 'dnf';
  rating?: number | null;
  added_at?: Date;
}

export interface Database {
  users: UsersTable;
  books: BooksTable;
  user_books: UserBooksTable;
}

const { Pool } = pg;

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
