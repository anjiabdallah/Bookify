import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import BackButton from '../components/BackButton';
import PageCard from '../components/PageCard';
import PageSectionHeader from '../components/PageSectionHeader';
import ShelfBookCard from '../components/ShelfBookCard';
import { useAuth } from '../context/useAuth';
import { useToast } from '../context/useToast';
import { useAsync } from '../hooks/useAsync';
import { requestServer } from '../lib/requestServer';

import type { GetShelfResponse, ShelfStatus } from '../../../server/src/api/types';

type ShelfPageKey = ShelfStatus | 'favorites' | 'physical_copy';

const shelfLabels: Record<ShelfPageKey, string> = {
  reading: 'Currently Reading',
  want_to_read: 'To Read',
  read: 'Read',
  dnf: 'DNFed',
  favorites: 'Favorites',
  physical_copy: 'Physical copies',
};

const emptyStateText: Record<ShelfPageKey, [string, string]> = {
  reading: ['No stories are open right now.', 'Start a new adventure!'],
  want_to_read: ['Your magical TBR awaits.', 'Add some books to read later!'],
  read: ['No finished books yet.', 'Time to complete your first!'],
  dnf: ['Nothing abandoned yet.', 'Sometimes books just aren\'t for us.'],
  favorites: ['No favorites yet.', 'Mark books you love as favorites.'],
  physical_copy: ['No physical copies yet.', 'Add books you own to this tag.'],
};

function ShelfPage() {
  const { status } = useParams<{ status: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const shelfQuery = useAsync<GetShelfResponse>();

  useEffect(() => {
    if (shelfQuery.error) {
      toast.showToast(shelfQuery.error, 'error');
    }
  }, [shelfQuery.error, toast]);

  useEffect(() => {
    if (!user) return;

    shelfQuery.execute(() => requestServer<GetShelfResponse>('/api/books/shelf'));
  }, [user?.id]);

  const shelfKey = status as ShelfPageKey;
  const shelfLabel = shelfLabels[shelfKey];

  const books = useMemo(() => {
    const allBooks = shelfQuery.data ?? [];

    if (!shelfLabel) {
      return [];
    }

    if (shelfKey === 'favorites') {
      return allBooks.filter(book => book.favorite);
    }

    if (shelfKey === 'physical_copy') {
      return allBooks.filter(book => book.physical_copy);
    }

    return allBooks.filter(book => book.status === shelfKey);
  }, [shelfQuery.data, shelfKey, shelfLabel]);

  const [emptyTitle, emptySubtitle] = emptyStateText[shelfKey];
  const isLoading = shelfQuery.loading;
  const bookCountDisplay = isLoading
    ? <span className="loading loading-spinner loading-xs inline-flex" />
    : books.length;

  if (!user) {
    return (
      <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center p-4">
        <div className="card bg-base-200 shadow-md w-full max-w-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Log in to see this shelf.</h2>
          <button onClick={() => navigate('/login')} className="btn btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!status || !shelfLabel) {
    return (
      <div className="min-h-screen bg-base-100 text-base-content">
        <main className="container mx-auto px-6 py-10">
          <PageCard>
            <div className="text-center">
              <h1 className="text-3xl font-bold">Shelf not found</h1>
              <p className="mt-4 text-base-content/70">The shelf you requested does not exist.</p>
              <div className="mt-6">
                <BackButton className="btn-primary" />
              </div>
            </div>
          </PageCard>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <main className="container mx-auto px-6 py-10">
        <div className="mb-6">
          <BackButton className="btn-ghost mb-4" />
          <PageSectionHeader
            label="Shelf"
            heading={(
              <span className="inline-flex items-center gap-2">
                <span>{shelfLabel}</span>
                <span className="text-base-content/70">
                  (
                  {bookCountDisplay}
                  )
                </span>
              </span>
            )}
          />
          <p className="mt-2 text-base text-base-content/70">
            View all books you added to this shelf.
          </p>
        </div>

        {books.length === 0
          ? (
              <PageCard>
                <div className="flex flex-col items-center justify-center gap-4 text-center py-16">
                  <div className="text-5xl text-primary/30">{shelfKey === 'reading' ? '📖' : shelfKey === 'want_to_read' ? '🌿' : shelfKey === 'read' ? '✨' : '🪄'}</div>
                  <div className="space-y-1 text-base text-base-content/70">
                    <p>{emptyTitle}</p>
                    <p>{emptySubtitle}</p>
                  </div>
                  <Link to="/search" className="btn btn-ghost btn-sm">
                    Browse Books
                  </Link>
                </div>
              </PageCard>
            )
          : (
              <div className="grid gap-4 md:grid-cols-2">
                {books.map(book => (
                  <ShelfBookCard
                    key={book.id}
                    book={book}
                    status={book.status}
                    onRate={(value) => {
                      if (shelfKey !== 'read') return;
                      requestServer('/api/books/shelf', {
                        method: 'POST',
                        body: JSON.stringify({
                          google_books_id: book.google_books_id,
                          title: book.title,
                          author: book.author,
                          cover_url: book.cover_url,
                          description: book.description,
                          published_date: book.published_date,
                          status: 'read',
                          rating: value,
                        }),
                      })
                        .then(() => shelfQuery.execute(() => requestServer<GetShelfResponse>('/api/books/shelf')))
                        .then(() => toast.showToast('Book rating saved.'))
                        .catch(err => toast.showToast(String(err), 'error'));
                    }}
                  />
                ))}
              </div>
            )}
      </main>
    </div>
  );
}

export default ShelfPage;
