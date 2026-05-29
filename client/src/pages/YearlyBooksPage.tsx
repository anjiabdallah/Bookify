import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import ShelfBookCard from '../components/book/ShelfBookCard';
import PageCard from '../components/ui/PageCard';
import PageSectionHeader from '../components/ui/PageSectionHeader';
import { useAuth } from '../context/useAuth';
import { useAsync } from '../hooks/useAsync';
import { requestServer } from '../lib/requestServer';

import type { YearlyBooksResponse } from '../../../server/src/api/types';

function YearlyBooksPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const yearlyQuery = useAsync<YearlyBooksResponse>();

  useEffect(() => {
    if (!user) return;
    yearlyQuery.execute(() => requestServer<YearlyBooksResponse>('/api/books/years'));
  }, [user]);

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
          <PageCard variant="bordered" className="shadow-none text-center text-base-content/70 p-8">
            Loading your yearly history...
          </PageCard>
        )}

        {!yearlyQuery.loading && yearlyQuery.data?.length === 0 && (
          <PageCard variant="bordered" className="border-dashed border-base-300 bg-base-100 p-10 text-center shadow-none">
            <div className="text-5xl text-primary/30">📅</div>
            <p className="mt-4 text-xl font-semibold">No finished book history yet.</p>
            <p className="mt-2 text-base text-base-content/70">Finish a book and its date will appear here by year.</p>
            <Link to="/search" className="btn btn-primary btn-sm mt-6">
              Add a finished book
            </Link>
          </PageCard>
        )}

        <div className="space-y-10">
          {yearlyQuery.data?.map(group => (
            <PageCard key={group.year} variant="bordered" className="shadow-none p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-2xl font-semibold">{group.year}</div>
                  <div className="text-sm text-base-content/60">
                    {group.finishes.length}
                    {' '}
                    finished entries
                  </div>
                </div>
                <div className="badge badge-outline badge-lg">Year view</div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {group.finishes.map(finish => (
                  <ShelfBookCard
                    key={`${group.year}-${finish.id}`}
                    book={finish}
                    status="read"
                  />
                ))}
              </div>
            </PageCard>
          ))}
        </div>
      </main>
    </div>
  );
}

export default YearlyBooksPage;
