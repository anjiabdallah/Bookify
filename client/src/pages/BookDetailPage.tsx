import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import BackButton from '../components/BackButton';
import PageCard from '../components/PageCard';
import PageSectionHeader from '../components/PageSectionHeader';
import StarRating from '../components/StarRating';
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

const stripHtml = (html: string | null) =>
  html?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() ?? null;

function BookDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const bookQuery = useAsync<BookDetailResponse>();
  const shelfSaver = useAsync<AddToShelfResponse>();
  const book = bookQuery.data;
  const [selectedShelf, setSelectedShelf] = useState<ShelfStatus>('want_to_read');
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [selectedFinishDate, setSelectedFinishDate] = useState<string>('');
  const [selectedFavorite, setSelectedFavorite] = useState<boolean>(false);
  const [selectedPhysicalCopy, setSelectedPhysicalCopy] = useState<boolean>(false);

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
          ...(book.cover_url ? { cover_url: book.cover_url } : {}),
          ...(stripHtml(book.description) ? { description: stripHtml(book.description) } : {}),
          ...(book.published_date ? { published_date: book.published_date } : {}),
          status: selectedShelf,
          ...(selectedShelf === 'read' && selectedRating > 0 ? { rating: selectedRating } : {}),
          ...(selectedShelf === 'read' && selectedFinishDate ? { finish_date: selectedFinishDate } : {}),
          favorite: selectedFavorite,
          physical_copy: selectedPhysicalCopy,
        }),
      }),
    );
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <main className="container mx-auto px-6 py-10">
        <div className="mb-6">
          <BackButton to="/search" className="btn-ghost mb-4" />
          <PageSectionHeader
            label="Book Details"
            heading={book?.title ?? 'Loading...'}
            right={user && (
              <div className="text-sm text-base-content/50">
                Logged in as
                <br />
                {user.username}
              </div>
            )}
          />
        </div>

        {bookQuery.loading && (
          <PageCard className="text-center">Loading book details…</PageCard>
        )}

        {bookQuery.error && (
          <div className="alert alert-error">
            <span>{bookQuery.error}</span>
          </div>
        )}

        {book && !bookQuery.loading && !bookQuery.error && (
          <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
            <PageCard className="p-6 shadow-sm">
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
                    <div className="mt-2 text-sm text-base-content/80">
                      {book.categories.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </PageCard>

            <PageCard>
              <h2 className="text-2xl font-semibold mb-4">About this book</h2>
              <p className="text-base-content/80 whitespace-pre-line">
                {stripHtml(book.description) ?? 'No description available for this title.'}
              </p>

              {user && (
                <div className="mt-8 space-y-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Add to shelf</span>
                    </label>
                    <select
                      value={selectedShelf}
                      onChange={(event) => {
                        const nextShelf = event.target.value as ShelfStatus;
                        setSelectedShelf(nextShelf);
                        if (nextShelf !== 'read') {
                          setSelectedFinishDate('');
                        }
                      }}
                      className="select select-bordered w-full"
                    >
                      {shelfOptions.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="cursor-pointer rounded-2xl border border-base-200 p-4 flex items-center justify-start gap-3">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={selectedFavorite}
                        onChange={event => setSelectedFavorite(event.target.checked)}
                      />
                      <span className="text-base font-medium">Favorites</span>
                    </label>

                    <label className="cursor-pointer rounded-2xl border border-base-200 p-4 flex items-center justify-start gap-3">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={selectedPhysicalCopy}
                        onChange={event => setSelectedPhysicalCopy(event.target.checked)}
                      />
                      <span className="text-base font-medium">Physical copy</span>
                    </label>
                  </div>

                  {selectedShelf === 'read' && (
                    <>
                      <div>
                        <label className="label">
                          <span className="label-text">Rate it now</span>
                        </label>
                        <StarRating value={selectedRating} onChange={setSelectedRating} />
                        <p className="text-sm text-base-content/60 mt-2">Optional: choose a star rating when you save this book as Read.</p>
                      </div>

                      <div className="mt-5">
                        <label className="label">
                          <span className="label-text">Finish date</span>
                        </label>
                        <input
                          type="date"
                          className="input input-bordered w-full"
                          value={selectedFinishDate}
                          onChange={event => setSelectedFinishDate(event.target.value)}
                        />
                        <p className="text-sm text-base-content/60 mt-2">Optionally set when you finished this book.</p>
                      </div>
                    </>
                  )}

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
                      <span>Book saved to your shelf.</span>
                    </div>
                  )}
                </div>
              )}
            </PageCard>
          </div>
        )}
      </main>
    </div>
  );
}

export default BookDetailPage;
