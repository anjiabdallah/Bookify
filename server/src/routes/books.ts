import { Router } from 'express';
import { z } from 'zod';

import { db } from '../db.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router = Router();

interface GoogleBooksResponse {
  items?: Array<{
    id: string;
    volumeInfo: {
      title: string;
      authors?: string[];
      description?: string;
      publishedDate?: string;
      imageLinks?: {
        thumbnail?: string;
      };
    };
  }>;
}

const addBookSchema = z.object({
  google_books_id: z.string(),
  title: z.string(),
  author: z.string(),
  cover_url: z.string().optional(),
  description: z.string().optional(),
  published_date: z.string().optional(),
  status: z.enum(['reading', 'read', 'want_to_read']),
});

// Search Google Books
router.get('/search', async (req, res) => {
  const query = req.query.q as string;
  if (!query) {
    res.status(400).json({ error: 'Query is required' });
    return;
  }

  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20&key=${process.env.GOOGLE_BOOKS_API_KEY}`,
  );
  const data = await response.json() as GoogleBooksResponse;

  const books = data.items?.map(item => ({
    google_books_id: item.id,
    title: item.volumeInfo.title,
    author: item.volumeInfo.authors?.[0] ?? 'Unknown',
    cover_url: item.volumeInfo.imageLinks?.thumbnail ?? null,
    description: item.volumeInfo.description ?? null,
    published_date: item.volumeInfo.publishedDate ?? null,
  })) ?? [];

  res.json(books);
});

// Add book to shelf
router.post('/shelf', authMiddleware, async (req: AuthRequest, res) => {
  const result = addBookSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }

  const { google_books_id, title, author, cover_url, description, published_date, status } = result.data;

  let book = await db
    .selectFrom('books')
    .where('google_books_id', '=', google_books_id)
    .selectAll()
    .executeTakeFirst();

  if (!book) {
    book = await db
      .insertInto('books')
      .values({ google_books_id, title, author, cover_url, description, published_date })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  const existing = await db
    .selectFrom('user_books')
    .where('user_id', '=', req.userId!)
    .where('book_id', '=', book.id!)
    .selectAll()
    .executeTakeFirst();

  if (existing) {
    res.status(409).json({ error: 'Book already on your shelf' });
    return;
  }

  const userBook = await db
    .insertInto('user_books')
    .values({ user_id: req.userId!, book_id: book.id!, status })
    .returningAll()
    .executeTakeFirstOrThrow();

  res.status(201).json({ book, userBook });
});

// Get user's shelf
router.get('/shelf', authMiddleware, async (req: AuthRequest, res) => {
  const books = await db
    .selectFrom('user_books')
    .innerJoin('books', 'books.id', 'user_books.book_id')
    .where('user_books.user_id', '=', req.userId!)
    .selectAll()
    .execute();

  res.json(books);
});

export default router;
