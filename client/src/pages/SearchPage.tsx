import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/useAuth';

interface SearchResult {
  google_books_id: string;
  title: string;
  author: string;
  cover_url?: string | null;
  description?: string | null;
  published_date?: string | null;
}

function SearchPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialQuery = params.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setError('Please enter a search term.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`http://localhost:3001/api/books/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Unable to search books.');
        setResults([]);
        return;
      }

      setResults(data);
    } catch {
      setError('Could not connect to the server.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery.trim()) {
      performSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query)}`);
    await performSearch(query);
  };

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
              <div className="text-sm text-base-content/70">Logged in as {user.username}</div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search books by title, author, or keyword"
              className="input input-bordered w-full bg-base-100"
            />
            <button type="submit" className="btn btn-primary">
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {error && (
            <div className="alert alert-error mt-6">
              <span>{error}</span>
            </div>
          )}

          <div className="mt-8 grid gap-4">
            {results.length > 0 ? (
              results.map(result => (
                <article key={result.google_books_id} className="card bg-base-100 shadow-sm">
                  <div className="card-body grid gap-4 lg:grid-cols-[120px_1fr] lg:items-start">
                    <div className="h-40 w-full overflow-hidden rounded-3xl bg-base-200 lg:h-full">
                      {result.cover_url ? (
                        <img
                          src={result.cover_url}
                          alt={result.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
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
                        <Link
                          to={`/book/${result.google_books_id}`}
                          className="btn btn-sm btn-primary"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              !loading && (
                <div className="rounded-3xl border border-base-200 bg-base-100 p-8 text-center text-base-content/70">
                  Enter a book title, author, or keyword to begin searching.
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default SearchPage;
