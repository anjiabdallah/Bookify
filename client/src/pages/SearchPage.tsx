import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useAuth } from '../context/useAuth';
import { useAsync } from '../hooks/useAsync';
import { requestServer } from '../lib/requestServer';

import type { SearchBooksResponse } from '../../../server/src/api/types';

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
  const searchRunner = useAsync<SearchBooksResponse>();

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

  const queryError = useMemo(() => errors.query?.message, [errors.query]);

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <main className="container mx-auto px-6 py-10">
        <div className="rounded-3xl bg-base-200 p-8 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-primary">Book Search</p>
              <h1 className="text-4xl font-bold">Find your next favorite read.</h1>
            </div>
            {user && (
              <div className="text-sm text-base-content/70">
                Logged in as
                {user.username}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div className="w-full">
              <input
                type="text"
                placeholder="Search books by title, author, or keyword"
                className="input input-bordered w-full bg-base-100"
                {...register('query')}
              />
              {queryError && <span className="text-sm text-error mt-1 block">{queryError}</span>}
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Searching...' : 'Search'}
            </button>
          </form>

          {searchRunner.error && (
            <div className="alert alert-error mt-6">
              <span>{searchRunner.error}</span>
            </div>
          )}

          <div className="mt-8 grid gap-4">
            {results.length > 0
              ? results.map(result => (
                  <article key={result.google_books_id} className="card bg-base-100 shadow-sm">
                    <div className="card-body grid gap-4 lg:grid-cols-[120px_1fr] lg:items-start">
                      <div className="h-40 w-full overflow-hidden rounded-3xl bg-base-200 lg:h-full">
                        {result.cover_url
                          ? (
                              <img
                                src={result.cover_url}
                                alt={result.title}
                                className="h-full w-full object-cover"
                              />
                            )
                          : (
                              <div className="flex h-full items-center justify-center text-sm text-base-content/50">
                                No cover available
                              </div>
                            )}
                      </div>
                      <div className="space-y-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h2 className="text-2xl font-semibold">{result.title}</h2>
                            <p className="text-sm text-base-content/70">{result.author}</p>
                          </div>
                          <div className="badge badge-outline">{result.published_date ?? 'Unknown'}</div>
                        </div>
                        <p className="text-base-content/80 line-clamp-4">
                          {result.description ?? 'No description available.'}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link to={`/book/${result.google_books_id}`} className="btn btn-sm btn-primary">
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              : !isSubmitting && (
                  <div className="rounded-3xl border border-base-200 bg-base-100 p-8 text-center text-base-content/70">
                    Enter a book title, author, or keyword to begin searching.
                  </div>
                )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default SearchPage;
