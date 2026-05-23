export type BookResult = {
  google_books_id: string;
  title: string;
  author: string;
  cover_url: string | null;
  description: string | null;
  published_date: string | null;
};

export type SearchBooksResponse = BookResult[];

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
    status: string;
    added_at: Date;
  };
};

export type GetShelfResponse = Array<{
  id: number;
  google_books_id: string;
  title: string;
  author: string;
  cover_url: string | null;
  status: string;
  added_at: Date;
}>;
