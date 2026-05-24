import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/useAuth';
import { useAsync } from '../hooks/useAsync';
import { requestServer } from '../lib/requestServer';

import type { GetShelfResponse, ShelfStatus } from '../../../server/src/api/types';

const shelfOrder: Array<[ShelfStatus, string]> = [
  ['favorite', 'Favorites'],
  ['reading', 'Currently reading'],
  ['want_to_read', 'To read'],
  ['read', 'Read'],
  ['dnf', 'DNFed'],
];

function MyBooksPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const shelfQuery = useAsync<GetShelfResponse>();

  useEffect(() => {
    shelfQuery.execute(() => requestServer<GetShelfResponse>('/api/books/shelf'));
  }, []);

  const shelves = useMemo(() => {
    const map: Record<ShelfStatus, GetShelfResponse> = {
      favorite: [],
      reading: [],
      want_to_read: [],
      read: [],
      dnf: [],
    };

    (shelfQuery.data ?? []).forEach(book => {
      map[book.status as ShelfStatus]?.push(book);
    });

    return map;
  }, [shelfQuery.data]);

  if (!user) {
    return (
      <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center p-4">
        <div className="card bg-base-200 shadow-md w-full max-w-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Log in to see your bookshelves.</h2>
          <button onClick={() => navigate('/login')} className="btn btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <main className="container mx-auto px-6 py-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary">My Books</p>
            <h1 className="text-4xl font-bold">Organize your shelves</h1>
            <p className="text-base-content/70 mt-1">View your favorites, current reads, to-read list, finished books, and DNFed titles.</p>
          </div>
        </div>

        <div className="space-y-8">
          {shelfOrder.map(([status, label]) => (
            <section key={status}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">{label}</h2>
                  <p className="text-sm text-base-content/70">{shelves[status].length} book{ shelves[status].length === 1 ? '' : 's' }</p>
                </div>
              </div>

              {shelves[status].length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {shelves[status].map(book => (
                    <article key={book.id} className="card bg-base-100 shadow-sm">
                      <div className="card-body grid gap-4 lg:grid-cols-[120px_1fr] lg:items-start">
                        <div className="h-36 w-full overflow-hidden rounded-3xl bg-base-200 lg:h-full">
                          {book.cover_url ? (
                            <img src={book.cover_url} alt={book.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm text-base-content/50">
                              No cover
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="text-xl font-semibold">{book.title}</h3>
                              <p className="text-sm text-base-content/70">{book.author}</p>
                            </div>
                            <div className="badge badge-outline">{book.status.replace('_', ' ')}</div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Link to={`/book/${book.google_books_id}`} className="btn btn-sm btn-ghost">
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-base-200 bg-base-100 p-8 text-center text-base-content/70">
                  No books in this shelf yet.
                </div>
              )}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

export default MyBooksPage;
