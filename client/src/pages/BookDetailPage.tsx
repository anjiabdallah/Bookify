import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useAuth } from '../context/useAuth';
import { useAsync } from '../hooks/useAsync';
import { requestServer } from '../lib/requestServer';

import type { AddToShelfResponse, BookDetailResponse, ShelfStatus } from '../../../server/src/api/types';

const shelfOptions: Array<[ShelfStatus, string]> = [
  ['reading', 'Currently reading'],
  ['want_to_read', 'To read'],
  ['read', 'Read'],
  ['dnf', 'DNFed'],
];

function BookDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const bookQuery = useAsync<BookDetailResponse>();
  const shelfSaver = useAsync<AddToShelfResponse>();
  const book = bookQuery.data;
  const [selectedShelf, setSelectedShelf] = useState<ShelfStatus>('want_to_read');

  useEffect(() => {
    if (!id) return;

    bookQuery.execute(() => requestServer<BookDetailResponse>(`/api/books/details/${encodeURIComponent(id)}`));
  }, [id]);

  const handleAddToShelf = async () => {
    if (!book) return;

    await shelfSaver.execute(() =>
      requestServer<AddToShelfResponse>('/api/books/shelf', {
        method: 'POST',
        body: JSON.stringify({
          google_books_id: book.google_books_id,
          title: book.title,
          author: book.authors[0] ?? 'Unknown',
          cover_url: book.cover_url,
          description: book.description,
          published_date: book.published_date,
          status: selectedShelf,
        }),
      }),
    );
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <main className="container mx-auto px-6 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Book Details</p>
            <h1 className="text-3xl font-bold">{book?.title ?? 'Loading...'}</h1>
            {user && (
              <p className="text-sm text-base-content/70">
                Viewing as
                {user.username}
              </p>
            )}
          </div>
          <Link to="/search" className="btn btn-ghost btn-sm">
            Back to Search
          </Link>
        </div>

        {bookQuery.loading && (
          <div className="rounded-3xl bg-base-200 p-8 text-center">Loading book details…</div>
        )}

        {bookQuery.error && (
          <div className="alert alert-error">
            <span>{bookQuery.error}</span>
          </div>
        )}

        {bookQuery.data && !bookQuery.loading && !bookQuery.error && (
          <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
            <div className="rounded-3xl bg-base-200 p-6 shadow-sm">
              <div className="h-96 overflow-hidden rounded-3xl bg-base-100">
                {book.cover_url
                  ? (
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="h-full w-full object-cover"
                      />
                    )
                  : (
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

              {user && (
                <div className="mt-8 space-y-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Add to shelf</span>
                    </label>
                    <select
                      value={selectedShelf}
                      onChange={event => setSelectedShelf(event.target.value as ShelfStatus)}
                      className="select select-bordered w-full"
                    >
                      {shelfOptions.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToShelf}
                    disabled={shelfSaver.loading}
                    className="btn btn-primary w-full"
                  >
                    {shelfSaver.loading ? 'Saving…' : 'Save to shelf'}
                  </button>

                  {shelfSaver.error && (
                    <div className="alert alert-error">
                      <span>{shelfSaver.error}</span>
                    </div>
                  )}

                  {shelfSaver.data && (
                    <div className="alert alert-success">
                      <span>{shelfSaver.data.message}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default BookDetailPage;
