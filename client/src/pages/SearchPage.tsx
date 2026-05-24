import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useAuth } from '../context/useAuth';
import { useAsync } from '../hooks/useAsync';
import { requestServer } from '../lib/requestServer';

import type { AddToShelfResponse, SearchBooksResponse } from '../../../server/src/api/types';

const searchSchema = z.object({
  query: z.string().trim().min(1, { message: 'Please enter a search term.' }),
});

type SearchFormData = z.infer<typeof searchSchema>;

function SearchPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialQuery = params.get('q') ?? '';

  const [results, setResults] = useState<SearchBooksResponse>([]);
  const [selectedBook, setSelectedBook] = useState<SearchBooksResponse[number] | null>(null);
  const [selectedShelf, setSelectedShelf] = useState<'reading' | 'want_to_read' | 'read'>('reading');
  const searchRunner = useAsync<SearchBooksResponse>();
  const addShelfRunner = useAsync<AddToShelfResponse>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: initialQuery },
  });

  const performSearch = useCallback(async (searchTerm: string) => {
    const data = await searchRunner.execute(() =>
      requestServer<SearchBooksResponse>(`/api/books/search?q=${encodeURIComponent(searchTerm)}`),
    );

    setResults(data ?? []);
  }, []);

  useEffect(() => {
    if (initialQuery.trim()) {
      reset({ query: initialQuery });
      performSearch(initialQuery);
    }
  }, [initialQuery, reset, performSearch]);

  const onSubmit = async (values: SearchFormData) => {
    navigate(`/search?q=${encodeURIComponent(values.query)}`);
    await performSearch(values.query);
  };

  const closeAddShelfModal = () => {
    setSelectedBook(null);
    const checkbox = document.getElementById('add-shelf-modal') as HTMLInputElement | null;
    if (checkbox) checkbox.checked = false;
  };

  const handleAddToShelf = async () => {
    if (!selectedBook) return;

    const body = JSON.stringify({
      google_books_id: selectedBook.google_books_id,
      title: selectedBook.title,
      author: selectedBook.author,
      cover_url: selectedBook.cover_url,
      description: selectedBook.description,
      published_date: selectedBook.published_date,
      status: selectedShelf,
    });

    await addShelfRunner.execute(() =>
      requestServer<AddToShelfResponse>('/api/books/shelf', {
        method: 'POST',
        body,
      }),
    );

    if (!addShelfRunner.error) {
      closeAddShelfModal();
    }
  };

  const queryError = useMemo(() => errors.query?.message, [errors.query]);

  let resultsContent = (
    <div className="mt-6 rounded-2xl border border-base-200 bg-base-100 p-12 text-center text-base-content/70">
      <div className="text-5xl text-primary/30">📖</div>
      <p className="mt-4">Enter a book title, author, or keyword to begin searching.</p>
    </div>
  );

  if (searchRunner.loading) {
    resultsContent = (
      <div className="mt-6 flex items-center justify-center rounded-2xl border border-base-200 bg-base-100 p-12 text-primary">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  } else if (results.length > 0) {
    resultsContent = (
      <div className="mt-6 flex flex-col gap-4">
        {results.map((result) => {
          return (
            <article key={result.google_books_id} className="rounded-2xl border border-base-200 bg-base-100 p-5">
              <div className="grid gap-5 lg:grid-cols-[100px_1fr] lg:items-start">
                <div className="h-36 w-full overflow-hidden rounded-xl bg-base-200">
                  {result.cover_url
                    ? (
                        <img src={result.cover_url} alt={result.title} className="h-full w-full object-cover" />
                      )
                    : (
                        <div className="flex h-full items-center justify-center text-xs text-base-content/30">
                          No cover
                        </div>
                      )}
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-base-content">{result.title}</h2>
                      <p className="text-sm text-base-content/60">{result.author}</p>
                    </div>
                    <div className="badge badge-outline">{result.published_date ?? 'Unknown'}</div>
                  </div>
                  <p className="text-sm text-base-content/70 line-clamp-3">{result.description ?? 'No description available.'}</p>
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/book/${result.google_books_id}`} className="btn btn-sm btn-primary rounded-xl">
                      View Details
                    </Link>
                    <label
                      htmlFor="add-shelf-modal"
                      className="btn btn-sm btn-outline btn-primary rounded-xl"
                      onClick={() => {
                        setSelectedBook(result);
                        setSelectedShelf('reading');
                      }}
                    >
                      + Add to Shelf
                    </label>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <main className="container mx-auto px-6 py-10">
        <div className="rounded-3xl bg-base-200 p-8 shadow-sm">
          <div className="relative overflow-hidden rounded-3xl bg-base-200 p-8 shadow-sm">
            <div className="absolute right-6 top-6 text-primary/20 text-3xl">✦ ✦</div>
            <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.5em] text-primary">BOOK SEARCH</p>
                <h1 className="mt-4 text-4xl font-bold text-base-content">Find your next favorite read.</h1>
              </div>
              {user && (
                <div className="text-sm text-base-content/50">
                  Logged in as
                  <br />
                  {user.username}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full">
                <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary/50" />
                <input
                  type="text"
                  placeholder="Search books by title, author, or keyword"
                  className="input input-bordered w-full bg-base-100 rounded-2xl pl-12"
                  {...register('query')}
                />
                {queryError && <span className="text-sm text-error mt-1 block">{queryError}</span>}
              </div>
              <button type="submit" className="btn btn-primary rounded-2xl px-8" disabled={isSubmitting}>
                {isSubmitting ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>

          {searchRunner.error && (
            <div className="alert alert-error mt-6">
              <span>{searchRunner.error}</span>
            </div>
          )}

          {resultsContent}
        </div>

        <input type="checkbox" id="add-shelf-modal" className="modal-toggle" />
        <div className="modal">
          <div className="modal-box max-w-lg">
            <h3 className="text-xl font-bold">Add to your shelf</h3>
            {selectedBook && (
              <>
                <p className="mt-3 text-base-content/70">{selectedBook.title}</p>
                <p className="text-sm text-base-content/50">{selectedBook.author}</p>
                <div className="mt-5">
                  <label className="label">
                    <span className="label-text">Shelf status</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={selectedShelf}
                    onChange={event => setSelectedShelf(event.target.value as 'reading' | 'want_to_read' | 'read')}
                  >
                    <option value="reading">Currently Reading</option>
                    <option value="want_to_read">Want to Read</option>
                    <option value="read">Read</option>
                  </select>
                </div>

                {addShelfRunner.error && (
                  <div className="alert alert-error mt-4">
                    <span>{addShelfRunner.error}</span>
                  </div>
                )}
                {addShelfRunner.data && (
                  <div className="alert alert-success mt-4">
                    <span>Book added to your shelf!</span>
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    type="button"
                    className="btn btn-primary w-full"
                    onClick={handleAddToShelf}
                    disabled={addShelfRunner.loading}
                  >
                    {addShelfRunner.loading ? 'Adding...' : 'Add to Shelf'}
                  </button>
                  <label htmlFor="add-shelf-modal" className="btn btn-ghost w-full">
                    Cancel
                  </label>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default SearchPage;
