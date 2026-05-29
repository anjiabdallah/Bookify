import { Router } from 'express';
import { z } from 'zod';

import { db } from '../../../db/index.js';
import { authMiddleware, type AuthRequest } from '../../../middleware/auth.js';

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

interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    publishedDate?: string;
    publisher?: string;
    pageCount?: number;
    categories?: string[];
    language?: string;
    previewLink?: string;
    imageLinks?: {
      thumbnail?: string;
    };
  };
}

const addBookSchema = z.object({
  google_books_id: z.string(),
  title: z.string(),
  author: z.string(),
  cover_url: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  published_date: z.string().nullable().optional(),
  status: z.enum(['reading', 'want_to_read', 'read', 'dnf']),
  rating: z.number().min(0.25).max(5).nullable().optional().refine((value) => {
    if (value === null || value === undefined) {
      return true;
    }
    return Number.isInteger(value * 4);
  }, { message: 'Rating must be in 0.25 increments.' }),
  finish_date: z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() === '') {
      return null;
    }
    return value;
  }, z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Finish date must be a valid YYYY-MM-DD date.' }).nullable().optional()),
  favorite: z.boolean().optional(),
  physical_copy: z.boolean().optional(),
});

// Search Google Books
router.get('/search', async (req, res) => {
  const query = req.query.q as string;
  const type = req.query.type as string ?? 'all';

  let googleQuery = query;
  if (type === 'author') googleQuery = `inauthor:${query}`;
  else if (type === 'title') googleQuery = `intitle:${query}`;

  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(googleQuery)}&maxResults=20&orderBy=relevance&key=${process.env.GOOGLE_BOOKS_API_KEY}`,
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

router.get('/details/:id', async (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.status(400).json({ error: 'Book ID is required' });
    return;
  }

  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(id)}?key=${process.env.GOOGLE_BOOKS_API_KEY}`,
  );
  const data = await response.json() as GoogleBookItem | { error?: unknown };

  if (!data || 'error' in data) {
    res.status(404).json({ error: 'Book not found' });
    return;
  }

  const bookData = data as GoogleBookItem;

  res.json({
    google_books_id: bookData.id,
    title: bookData.volumeInfo.title,
    authors: bookData.volumeInfo.authors ?? ['Unknown'],
    cover_url: bookData.volumeInfo.imageLinks?.thumbnail ?? null,
    description: bookData.volumeInfo.description ?? null,
    published_date: bookData.volumeInfo.publishedDate ?? null,
    publisher: bookData.volumeInfo.publisher ?? null,
    page_count: bookData.volumeInfo.pageCount ?? null,
    categories: bookData.volumeInfo.categories ?? [],
    language: bookData.volumeInfo.language ?? null,
    preview_link: bookData.volumeInfo.previewLink ?? null,
  });
});

// Add book to shelf
router.post('/shelf', authMiddleware, async (req: AuthRequest, res) => {
  const result = addBookSchema.safeParse(req.body);
  if (!result.success) {
    const flattened = result.error.flatten();
    const message = flattened.formErrors.length > 0
      ? flattened.formErrors.join(', ')
      : Object.values(flattened.fieldErrors).flat().join(', ');
    res.status(400).json({ error: message || 'Invalid book data' });
    return;
  }

  const { google_books_id, title, author, cover_url, description, published_date, status, rating, finish_date, favorite, physical_copy } = result.data;

  let book = await db
    .selectFrom('books')
    .where('google_books_id', '=', google_books_id)
    .select(['id', 'google_books_id', 'title', 'author', 'cover_url', 'description', 'published_date'])
    .executeTakeFirst();

  if (!book) {
    book = await db
      .insertInto('books')
      .values({ google_books_id, title, author, cover_url, description, published_date })
      .returning(['id', 'google_books_id', 'title', 'author', 'cover_url', 'description', 'published_date'])
      .executeTakeFirstOrThrow();
  }

  const existing = await db
    .selectFrom('user_books')
    .where('user_id', '=', req.userId!)
    .where('book_id', '=', book.id!)
    .selectAll()
    .executeTakeFirst();

  let userBook;
  if (!existing) {
    userBook = await db
      .insertInto('user_books')
      .values({
        user_id: req.userId!,
        book_id: book.id!,
        status,
        rating: status === 'read' ? rating ?? null : null,
        finish_date: status === 'read' ? finish_date ?? null : null,
        favorite: favorite ?? false,
        physical_copy: physical_copy ?? false,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  } else {
    const ratingUpdate = status === 'read' ? rating ?? existing.rating ?? null : null;
    const favoriteUpdate = favorite !== undefined ? favorite : existing.favorite ?? false;
    const physicalCopyUpdate = physical_copy !== undefined ? physical_copy : existing.physical_copy ?? false;
    const statusChanged = existing.status !== status;
    const ratingChanged = rating !== undefined && rating !== existing.rating;
    const favoriteChanged = favorite !== undefined && favorite !== existing.favorite;
    const physicalCopyChanged = physical_copy !== undefined && physical_copy !== existing.physical_copy;
    const finishDateChanged = existing.finish_date !== (status === 'read' ? finish_date ?? null : null);

    if (statusChanged || ratingChanged || favoriteChanged || physicalCopyChanged || finishDateChanged) {
      userBook = await db
        .updateTable('user_books')
        .set({
          status,
          rating: ratingUpdate,
          finish_date: status === 'read' ? finish_date ?? null : null,
          favorite: favoriteUpdate,
          physical_copy: physicalCopyUpdate,
        })
        .where('id', '=', existing.id)
        .returningAll()
        .executeTakeFirstOrThrow();
    } else {
      userBook = existing;
    }
  }

  if (status === 'read' && finish_date) {
    const existingFinish = await db
      .selectFrom('user_book_finish_dates')
      .where('user_book_id', '=', userBook.id!)
      .where('finished_at', '=', finish_date)
      .select('id')
      .executeTakeFirst();

    if (!existingFinish) {
      await db
        .insertInto('user_book_finish_dates')
        .values({
          user_book_id: userBook.id!,
          finished_at: finish_date,
        })
        .execute();
    }
  }

  res.status(existing ? 200 : 201).json({ book, userBook });
});

router.get('/years', authMiddleware, async (req: AuthRequest, res) => {
  type YearlyBookRow = {
    finished_at: string | Date;
    id: number;
    status: 'reading' | 'want_to_read' | 'read' | 'dnf';
    rating: number | null;
    favorite: boolean;
    physical_copy: boolean;
    added_at: string | Date;
    google_books_id: string;
    title: string;
    author: string;
    cover_url: string | null;
    description: string | null;
    published_date: string | null;
  };

  type YearlyBookEntry = {
    id: number;
    google_books_id: string;
    title: string;
    author: string;
    cover_url: string | null;
    description: string | null;
    published_date: string | null;
    status: 'reading' | 'want_to_read' | 'read' | 'dnf';
    rating: number | null;
    favorite: boolean;
    physical_copy: boolean;
    finished_at: string;
    added_at: string;
  };

  const rows = await db
    .selectFrom('user_book_finish_dates')
    .innerJoin('user_books', 'user_books.id', 'user_book_finish_dates.user_book_id')
    .innerJoin('books', 'books.id', 'user_books.book_id')
    .where('user_books.user_id', '=', req.userId!)
    .select([
      'user_book_finish_dates.finished_at as finished_at',
      'user_books.id as id',
      'user_books.status as status',
      'user_books.rating as rating',
      'user_books.favorite as favorite',
      'user_books.physical_copy as physical_copy',
      'user_books.added_at as added_at',
      'books.google_books_id as google_books_id',
      'books.title as title',
      'books.author as author',
      'books.cover_url as cover_url',
      'books.description as description',
      'books.published_date as published_date',
    ])
    .orderBy('user_book_finish_dates.finished_at', 'desc')
    .execute() as YearlyBookRow[];

  const grouped = rows.reduce<Record<string, YearlyBookEntry[]>>((acc, row) => {
    const finishedAt = typeof row.finished_at === 'string'
      ? row.finished_at
      : row.finished_at.toISOString().split('T')[0];
    const finishedAtString = finishedAt as string;
    const year = new Date(finishedAtString).getFullYear().toString();
    const entry: YearlyBookEntry = {
      id: row.id,
      google_books_id: row.google_books_id,
      title: row.title,
      author: row.author,
      cover_url: row.cover_url,
      description: row.description,
      published_date: row.published_date,
      status: row.status,
      rating: row.rating,
      favorite: row.favorite,
      physical_copy: row.physical_copy,
      finished_at: finishedAtString,
      added_at: typeof row.added_at === 'string' ? row.added_at : row.added_at.toISOString(),
    };

    if (!acc[year]) {
      acc[year] = [entry];
    } else {
      acc[year].push(entry);
    }

    return acc;
  }, {});

  const result = Object.entries(grouped)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, finishes]) => ({ year, finishes }));

  res.json(result);
});

// Get user's shelf
router.get('/shelf', authMiddleware, async (req: AuthRequest, res) => {
  const books = await db
    .selectFrom('user_books')
    .innerJoin('books', 'books.id', 'user_books.book_id')
    .where('user_books.user_id', '=', req.userId!)
    .select([
      'books.id',
      'books.google_books_id',
      'books.title',
      'books.author',
      'books.cover_url',
      'books.description',
      'books.published_date',
      'user_books.status',
      'user_books.rating',
      'user_books.finish_date',
      'user_books.favorite',
      'user_books.physical_copy',
      'user_books.added_at',
    ])
    .execute();

  res.json(books);
});

export default router;
