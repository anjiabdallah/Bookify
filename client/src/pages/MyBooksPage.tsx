import { BookOpen, Bookmark, CheckCircle, XCircle } from 'lucide-react';
import { type ReactNode, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import PageCard from '../components/PageCard';
import PageSectionHeader from '../components/PageSectionHeader';
import ShelfBookCard from '../components/ShelfBookCard';
import { useAuth } from '../context/useAuth';
import { useAsync } from '../hooks/useAsync';
import { requestServer } from '../lib/requestServer';

import type { AddToShelfResponse, GetShelfResponse, ShelfStatus } from '../../../server/src/api/types';

const shelfOrder: Array<[ShelfStatus, string]> = [
  ['reading', 'Currently Reading'],
  ['want_to_read', 'To Read'],
  ['read', 'Read'],
  ['dnf', 'DNFed'],
];

const emptyStateText: Record<ShelfStatus, [string, string]> = {
  reading: ['No stories are open right now.', 'Start a new adventure!'],
  want_to_read: ['Your magical TBR awaits.', 'Add some books to read later!'],
  read: ['No finished books yet.', 'Time to complete your first!'],
  dnf: ['Nothing abandoned yet.', 'Sometimes books just aren\'t for us.'],
};

const sectionIcons: Record<ShelfStatus, ReactNode> = {
  reading: <BookOpen size={18} className="text-primary/50" />,
  want_to_read: <Bookmark size={18} className="text-primary/50" />,
  read: <CheckCircle size={18} className="text-primary/50" />,
  dnf: <XCircle size={18} className="text-primary/50" />,
};

function MyBooksPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const shelfQuery = useAsync<GetShelfResponse>();
  const ratingSaver = useAsync<AddToShelfResponse>();

  useEffect(() => {
    shelfQuery.execute(() => requestServer<GetShelfResponse>('/api/books/shelf'));
  }, []);

  const shelves = useMemo(() => {
    const map: Record<ShelfStatus, GetShelfResponse> = {
      reading: [],
      want_to_read: [],
      read: [],
      dnf: [],
    };

    (shelfQuery.data ?? []).forEach((book) => {
      map[book.status as ShelfStatus]?.push(book);
    });

    return map;
  }, [shelfQuery.data]);

  const favoriteBooks = useMemo(
    () => (shelfQuery.data ?? []).filter(book => book.favorite),
    [shelfQuery.data],
  );

  const physicalCopyBooks = useMemo(
    () => (shelfQuery.data ?? []).filter(book => book.physical_copy),
    [shelfQuery.data],
  );

  const stats = useMemo(
    () => ({
      reading: shelves.reading.length,
      want_to_read: shelves.want_to_read.length,
      read: shelves.read.length,
      dnf: shelves.dnf.length,
      favorites: favoriteBooks.length,
      physical_copy: physicalCopyBooks.length,
    }),
    [shelves, favoriteBooks.length, physicalCopyBooks.length],
  );

  const handleRate = async (book: GetShelfResponse[number], rating: number) => {
    if (book.status !== 'read') return;

    const result = await ratingSaver.execute(() =>
      requestServer<AddToShelfResponse>('/api/books/shelf', {
        method: 'POST',
        body: JSON.stringify({
          google_books_id: book.google_books_id,
          title: book.title,
          author: book.author,
          cover_url: book.cover_url,
          description: book.description,
          published_date: book.published_date,
          status: 'read',
          rating,
        }),
      }),
    );

    if (result) {
      shelfQuery.execute(() => requestServer<GetShelfResponse>('/api/books/shelf'));
    }
  };

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
        <div className="mb-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <PageSectionHeader
              label="My Books"
              heading="Organize your shelves"
              right={(
                <div className="relative flex h-full w-full max-w-xs flex-col items-center justify-center rounded-[2rem] border border-primary/10 bg-primary/10 p-8 text-primary/80 shadow-lg shadow-primary/10">
                  <div className="text-6xl">📚</div>
                  <div className="mt-3 flex items-center gap-2 text-primary/30 text-2xl">✦</div>
                  <div className="mt-4 text-center text-sm text-base-content/70">A gentle stack of stories waiting for you.</div>
                </div>
              )}
            />
            <p className="mt-4 max-w-2xl text-base text-base-content/70">
              View your current reads, to-read list, finished books, and DNFed titles.
            </p>
          </div>
        </div>

        {ratingSaver.error && (
          <div className="alert alert-error mb-6">
            <span>{ratingSaver.error}</span>
          </div>
        )}

        {ratingSaver.data && (
          <div className="alert alert-success mb-6">
            <span>Book rating saved.</span>
          </div>
        )}

        <PageCard variant="bordered" className="grid gap-4 md:grid-cols-4">
          <div className="flex flex-col items-center gap-3 border-r border-base-200 pr-4 last:border-r-0 last:pr-0">
            <BookOpen size={24} className="text-primary/50" />
            <div className="text-3xl font-bold">{stats.reading}</div>
            <div className="text-sm text-base-content/60">Currently Reading</div>
          </div>
          <div className="flex flex-col items-center gap-3 border-r border-base-200 pr-4 last:border-r-0 last:pr-0">
            <Bookmark size={24} className="text-primary/50" />
            <div className="text-3xl font-bold">{stats.want_to_read}</div>
            <div className="text-sm text-base-content/60">To Read</div>
          </div>
          <div className="flex flex-col items-center gap-3 border-r border-base-200 pr-4 last:border-r-0 last:pr-0">
            <CheckCircle size={24} className="text-primary/50" />
            <div className="text-3xl font-bold">{stats.read}</div>
            <div className="text-sm text-base-content/60">Read</div>
          </div>
          <div className="flex flex-col items-center gap-3 border-r border-base-200 pr-4 last:border-r-0 last:pr-0">
            <XCircle size={24} className="text-primary/50" />
            <div className="text-3xl font-bold">{stats.dnf}</div>
            <div className="text-sm text-base-content/60">DNFed</div>
          </div>
          <div className="flex flex-col items-center gap-3 border-r border-base-200 pr-4 last:border-r-0 last:pr-0">
            <span className="text-primary/50 text-3xl">❤️</span>
            <div className="text-3xl font-bold">{stats.favorites}</div>
            <div className="text-sm text-base-content/60">Favorites</div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="text-primary/50 text-3xl">📦</span>
            <div className="text-3xl font-bold">{stats.physical_copy}</div>
            <div className="text-sm text-base-content/60">Physical copies</div>
          </div>
        </PageCard>

        <div className="mt-10 space-y-8">
          {favoriteBooks.length > 0 && (
            <section className="mb-10">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Favorites</h2>
                <span className="badge badge-primary badge-outline">{favoriteBooks.length}</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {favoriteBooks.map(book => (
                  <ShelfBookCard
                    key={`fav-${book.id}`}
                    book={book}
                    status={book.status}
                  />
                ))}
              </div>
            </section>
          )}

          {physicalCopyBooks.length > 0 && (
            <section className="mb-10">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Physical copies</h2>
                <span className="badge badge-primary badge-outline">{physicalCopyBooks.length}</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {physicalCopyBooks.map(book => (
                  <ShelfBookCard
                    key={`phys-${book.id}`}
                    book={book}
                    status={book.status}
                  />
                ))}
              </div>
            </section>
          )}

          {shelfOrder.map(([status, label]) => {
            const books = shelves[status];
            const [emptyTitle, emptySubtitle] = emptyStateText[status];

            return (
              <section key={status}>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span>{sectionIcons[status]}</span>
                    <h2 className="text-2xl font-semibold">
                      {label}
                      {' '}
                      (
                      {books.length}
                      )
                    </h2>
                  </div>
                  <Link to="/search" className="btn btn-primary btn-sm rounded-full">
                    + Add a book
                  </Link>
                </div>

                <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-8">
                  {books.length === 0
                    ? (
                        <div className="flex flex-col items-center justify-center gap-4 text-center">
                          <div className="text-5xl text-primary/30">{status === 'reading' ? '📖' : status === 'want_to_read' ? '🌿' : status === 'read' ? '✨' : '🪄'}</div>
                          <div className="space-y-1 text-base text-base-content/70">
                            <p>{emptyTitle}</p>
                            <p>{emptySubtitle}</p>
                          </div>
                          <Link to="/search" className="btn btn-ghost btn-sm">
                            Browse Books
                          </Link>
                        </div>
                      )
                    : (
                        <div className="grid gap-4 md:grid-cols-2">
                          {books.map(book => (
                            <ShelfBookCard
                              key={book.id}
                              book={book}
                              status={status}
                              onRate={value => handleRate(book, value)}
                            />
                          ))}
                        </div>
                      )}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-12 rounded-3xl bg-base-200 p-8 text-base-content shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1fr_2fr_1fr] lg:items-center">
            <div className="rounded-3xl bg-primary/10 p-6 text-center text-primary/70">✦</div>
            <div>
              <h2 className="text-2xl font-bold">Looking for your next adventure?</h2>
              <p className="mt-3 text-base text-base-content/70">Discover new books that match your mood.</p>
            </div>
            <div className="flex items-center justify-center">
              <Link to="/search" className="btn btn-primary rounded-full px-8 py-3">
                Explore Books →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MyBooksPage;
