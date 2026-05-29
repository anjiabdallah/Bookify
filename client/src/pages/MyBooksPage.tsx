import { BookOpen, Bookmark, CheckCircle, Heart, Package, XCircle } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import PageCard from '../components/PageCard';
import PageSectionHeader from '../components/PageSectionHeader';
import { useAuth } from '../context/useAuth';
import { useToast } from '../context/useToast';
import { useAsync } from '../hooks/useAsync';
import { requestServer } from '../lib/requestServer';

import type { AddToShelfResponse, GetShelfResponse, ShelfStatus } from '../../../server/src/api/types';

function MyBooksPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const shelfQuery = useAsync<GetShelfResponse>();
  const ratingSaver = useAsync<AddToShelfResponse>();

  useEffect(() => {
    if (ratingSaver.error) {
      toast.showToast(ratingSaver.error, 'error');
    }
  }, [ratingSaver.error, toast]);

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
            />
            <p className="mt-4 max-w-2xl text-base text-base-content/70">
              View your current reads, to-read list, finished books, and DNFed titles.
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <PageCard variant="bordered" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Exclusive Shelves</h3>
            </div>
            <div className="grid grid-cols-2 divide-x divide-y divide-base-200">
              <div className="flex flex-col items-center gap-3 p-4">
                <BookOpen size={28} className="text-primary/50" />
                <div className="text-3xl font-bold">{stats.reading}</div>
                <Link to="/my-books/reading" className="text-sm font-semibold text-primary hover:underline">
                  Currently Reading
                </Link>
              </div>
              <div className="flex flex-col items-center gap-3 p-4">
                <Bookmark size={28} className="text-primary/50" />
                <div className="text-3xl font-bold">{stats.want_to_read}</div>
                <Link to="/my-books/want_to_read" className="text-sm font-semibold text-primary hover:underline">
                  To Read
                </Link>
              </div>
              <div className="flex flex-col items-center gap-3 p-4">
                <CheckCircle size={28} className="text-primary/50" />
                <div className="text-3xl font-bold">{stats.read}</div>
                <Link to="/my-books/read" className="text-sm font-semibold text-primary hover:underline">
                  Read
                </Link>
              </div>
              <div className="flex flex-col items-center gap-3 p-4">
                <XCircle size={28} className="text-primary/50" />
                <div className="text-3xl font-bold">{stats.dnf}</div>
                <Link to="/my-books/dnf" className="text-sm font-semibold text-primary hover:underline">
                  DNFed
                </Link>
              </div>
            </div>
          </PageCard>

          <PageCard variant="bordered" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Additional Tags</h3>
            </div>
            <div className="grid grid-cols-2 divide-x divide-base-200">
              <div className="flex flex-col items-center gap-3 p-4">
                <Heart size={28} className="text-primary/50" />
                <div className="text-3xl font-bold">{stats.favorites}</div>
                <Link to="/my-books/favorites" className="text-sm font-semibold text-primary hover:underline">
                  Favorites
                </Link>
              </div>
              <div className="flex flex-col items-center gap-3 p-4">
                <Package size={28} className="text-primary/50" />
                <div className="text-3xl font-bold">{stats.physical_copy}</div>
                <Link to="/my-books/physical_copy" className="text-sm font-semibold text-primary hover:underline">
                  Physical copies
                </Link>
              </div>
            </div>
          </PageCard>
        </div>

        <div className="mt-10 rounded-3xl bg-base-200 p-8 text-base-content shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
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
