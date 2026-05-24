export type BookResult = {
  google_books_id: string;
  title: string;
  author: string;
  cover_url: string | null;
  description: string | null;
  published_date: string | null;
};

export type SearchBooksResponse = BookResult[];

export type ShelfStatus = 'reading' | 'want_to_read' | 'read' | 'dnf';

export type BookDetailResponse = {
  google_books_id: string;
  title: string;
  authors: string[];
  cover_url: string | null;
  description: string | null;
  published_date: string | null;
  publisher: string | null;
  page_count: number | null;
  categories: string[];
  language: string | null;
  preview_link: string | null;
};

export type AddToShelfResponse = {
  book: {
    id: number;
    google_books_id: string;
    title: string;
    author: string;
    cover_url: string | null;
    description: string | null;
    published_date: string | null;
  };
  userBook: {
    id: number;
    user_id: number;
    book_id: number;
    status: ShelfStatus;
    rating: number | null;
    finish_date: string | null;
    added_at: string;
  };
};

export type GetShelfResponse = Array<{
  id: number;
  google_books_id: string;
  title: string;
  author: string;
  cover_url: string | null;
  description: string | null;
  published_date: string | null;
  status: ShelfStatus;
  rating: number | null;
  finish_date: string | null;
  added_at: string;
}>;
