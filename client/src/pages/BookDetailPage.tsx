import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useAuth } from '../context/useAuth';

interface BookDetail {
  google_books_id: string;
  title: string;
  authors: string[];
  cover_url?: string | null;
  description?: string | null;
  published_date?: string | null;
  publisher?: string | null;
  page_count?: number | null;
  categories: string[];
  language?: string | null;
  preview_link?: string | null;
}

function BookDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const loadBook = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch(`http://localhost:3001/api/books/details/${encodeURIComponent(id)}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Unable to load book details.');
          return;
        }

        setBook(data);
      } catch {
        setError('Could not connect to the server.');
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [id]);

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <main className="container mx-auto px-6 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Book Details</p>
            <h1 className="text-3xl font-bold">{book?.title ?? 'Loading...'}</h1>
            {user && <p className="text-sm text-base-content/70">Viewing as {user.username}</p>}
          </div>
          <Link to="/search" className="btn btn-ghost btn-sm">
            Back to Search
          </Link>
        </div>

        {loading && (
          <div className="rounded-3xl bg-base-200 p-8 text-center">Loading book details…</div>
        )}

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {book && !loading && !error && (
          <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
            <div className="rounded-3xl bg-base-200 p-6 shadow-sm">
              <div className="h-96 overflow-hidden rounded-3xl bg-base-100">
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-base-content/50">
                    No cover available
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-3 text-sm text-base-content/80">
                <div>
                  <div className="font-semibold">Author</div>
                  <div>{book.authors.join(', ')}</div>
                </div>
                <div>
                  <div className="font-semibold">Publisher</div>
                  <div>{book.publisher ?? 'Unknown'}</div>
                </div>
                <div>
                  <div className="font-semibold">Published</div>
                  <div>{book.published_date ?? 'Unknown'}</div>
                </div>
                <div>
                  <div className="font-semibold">Pages</div>
                  <div>{book.page_count ?? 'Unknown'}</div>
                </div>
                <div>
                  <div className="font-semibold">Language</div>
                  <div>{book.language ?? 'Unknown'}</div>
                </div>
                {book.categories.length > 0 && (
                  <div>
                    <div className="font-semibold">Categories</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {book.categories.map(category => (
                        <span key={category} className="badge badge-outline">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {book.preview_link && (
                  <div>
                    <a href={book.preview_link} target="_blank" rel="noreferrer" className="link link-primary">
                      Preview on Google Books
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-base-200 p-8 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">About this book</h2>
              <p className="text-base-content/80 whitespace-pre-line">
                {book.description ?? 'No description available for this title.'}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default BookDetailPage;
