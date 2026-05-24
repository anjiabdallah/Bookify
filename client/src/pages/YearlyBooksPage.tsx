import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import BookCard from '../components/BookCard';
import PageSectionHeader from '../components/PageSectionHeader';
import { useAuth } from '../context/useAuth';
import { useAsync } from '../hooks/useAsync';
import { requestServer } from '../lib/requestServer';

import type { YearlyBooksResponse } from '../../../server/src/api/types';

const formatFinishDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());

  return `${day}/${month}/${year}`;
};

function YearlyBooksPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const yearlyQuery = useAsync<YearlyBooksResponse>();

  useEffect(() => {
    yearlyQuery.execute(() => requestServer<YearlyBooksResponse>('/api/books/years'));
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center p-4">
        <div className="card bg-base-200 shadow-md w-full max-w-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Log in to view your finish year history.</h2>
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
        <div className="mb-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <PageSectionHeader
              label="Yearly View"
              heading="Books finished by year"
              right={(
                <Link to="/my-books" className="btn btn-primary btn-sm rounded-full">
                  Back to My Books
                </Link>
              )}
            />
            <p className="mt-4 max-w-2xl text-base text-base-content/70">
              Each completion is recorded by year so you can revisit the books you finished across different seasons.
            </p>
          </div>
        </div>

        {yearlyQuery.error && (
          <div className="alert alert-error mb-6">
            <span>{yearlyQuery.error}</span>
          </div>
        )}

        {yearlyQuery.loading && (
          <div className="rounded-3xl border border-base-200 bg-base-100 p-8 text-center text-base-content/70">
            Loading your yearly history...
          </div>
        )}

        {!yearlyQuery.loading && yearlyQuery.data?.length === 0 && (
          <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 p-10 text-center">
            <div className="text-5xl text-primary/30">📅</div>
            <p className="mt-4 text-xl font-semibold">No finished book history yet.</p>
            <p className="mt-2 text-base text-base-content/70">Finish a book and its date will appear here by year.</p>
            <Link to="/search" className="btn btn-primary btn-sm mt-6">
              Add a finished book
            </Link>
          </div>
        )}

        <div className="space-y-10">
          {yearlyQuery.data?.map((group) => (
            <section key={group.year} className="rounded-3xl border border-base-200 bg-base-100 p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-2xl font-semibold">{group.year}</div>
                  <div className="text-sm text-base-content/60">{group.finishes.length} finished entries</div>
                </div>
                <div className="badge badge-outline badge-lg">Year view</div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {group.finishes.map((finish) => (
                  <BookCard
                    key={`${group.year}-${finish.id}`}
                    coverUrl={finish.cover_url}
                    title={finish.title}
                    author={finish.author}
                    topRight={(
                      <Link to={`/book/${finish.google_books_id}`} className="badge badge-outline badge-sm">
                        View details
                      </Link>
                    )}
                    className="p-4 shadow-sm"
                  >
                    <div className="space-y-3 text-sm text-base-content/70">
                      <div className="flex flex-wrap gap-2">
                        <span className="badge badge-success badge-sm">Finished</span>
                        {finish.favorite && <span className="badge badge-primary badge-sm">Favorite</span>}
                        {finish.physical_copy && <span className="badge badge-accent badge-sm">Physical copy</span>}
                      </div>
                      <div>Finished on {formatFinishDate(finish.finished_at)}</div>
                      {finish.rating !== null && (
                        <div>Rating: {finish.rating.toFixed(2)}</div>
                      )}
                    </div>
                  </BookCard>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

export default YearlyBooksPage;
