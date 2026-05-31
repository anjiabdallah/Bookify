import { Users, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import BookCard from '../components/book/BookCard';
import CoverImage from '../components/book/CoverImage';
import PageCard from '../components/ui/PageCard';
import PageSectionHeader from '../components/ui/PageSectionHeader';
import SearchBar from '../components/ui/SearchBar';
import { useAuth } from '../context/useAuth';
import { useAsync } from '../hooks/useAsync';
import { requestServer } from '../lib/requestServer';

import type { GetShelfResponse } from '../../../server/src/api/types';

const communityUpdates = [
  { name: 'Ivy', action: 'finished Shadowbound', time: '2h ago' },
  { name: 'Noah', action: 'added a review for Wildflower Woods', time: '5h ago' },
  { name: 'Mila', action: 'commented on your list', time: '1d ago' },
];

function HomePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [readingProgress, setReadingProgress] = useState(62);
  const [draftProgress, setDraftProgress] = useState(62);
  const [isProgressSheetOpen, setIsProgressSheetOpen] = useState(false);
  const navigate = useNavigate();
  const shelfQuery = useAsync<GetShelfResponse>();

  useEffect(() => {
    if (!user) return;
    shelfQuery.execute(() => requestServer<GetShelfResponse>('/api/books/shelf'));
  }, [user]);

  const handleOpenProgressSheet = () => {
    setDraftProgress(readingProgress);
    setIsProgressSheetOpen(true);
  };

  const handleCancelProgress = () => {
    setIsProgressSheetOpen(false);
  };

  const handleSaveProgress = () => {
    setReadingProgress(draftProgress);
    setIsProgressSheetOpen(false);
  };

  const filteredBooks = useMemo(() => {
    if (!shelfQuery.data) return [];
    if (activeTab === 'All') return shelfQuery.data;

    const tabMap: Record<string, 'reading' | 'want_to_read' | 'read' | 'dnf' | null> = {
      'All': null,
      'Reading': 'reading',
      'To Read': 'want_to_read',
      'Read': 'read',
      'DNF': 'dnf',
    };

    const status = tabMap[activeTab];
    return status ? shelfQuery.data.filter(book => book.status === status) : shelfQuery.data;
  }, [activeTab, shelfQuery.data]);

  const formatShelfStatus = (status: string) => {
    if (status === 'want_to_read') return 'To read';
    if (status === 'reading') return 'Reading';
    if (status === 'read') return 'Read';
    if (status === 'dnf') return 'DNF';
    return status;
  };

  const currentReadingBook = useMemo(() => {
    if (!shelfQuery.data) return null;
    return shelfQuery.data.find(book => book.status === 'reading') ?? null;
  }, [shelfQuery.data]);

  if (!user) {
    return (
      <div className="min-h-screen bg-base-100 text-base-content">
        <section className="hero min-h-screen bg-base-200 rounded-b-[3rem]">
          <div className="hero-content flex-col lg:flex-row gap-16 px-8 py-20">
            <div className="max-w-2xl">
              <h1 className="text-5xl font-bold">Where stories bloom</h1>
              <p className="py-6 text-lg text-base-content/80">
                Discover magical reads, track your journey, and connect with fellow book lovers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Join the Community
                </Link>
              </div>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={(event) => {
                  event.preventDefault();
                  navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                }}
              />
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <main className="container mx-auto px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1.7fr_0.9fr]">
          <section className="space-y-8">
            <div className="rounded-3xl bg-base-200 p-8 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-primary">
                    Welcome back,
                    {' '}
                    {user.username}
                    ! ✨
                  </p>
                  <h1 className="text-4xl font-bold">Your reading haven awaits.</h1>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link to="/search" className="btn btn-primary gap-2">
                    <Plus size={18} />
                    {' '}
                    Add a Book
                  </Link>
                  <Link to="/profile" className="btn btn-secondary">
                    View Profile
                  </Link>
                </div>
              </div>
            </div>

            <PageCard>
              <PageSectionHeader
                label="My Books"
                heading="Your current reads"
              />
              <div className="tabs tabs-boxed">
                {['All', 'Reading', 'Read', 'To Read', 'DNF'].map(tab => (
                  <button
                    key={tab}
                    className={`tab ${activeTab === tab ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="mt-8 grid gap-4">
                {shelfQuery.loading && (
                  <div className="rounded-3xl bg-base-200 p-8 text-center text-base-content/70">
                    Loading your books…
                  </div>
                )}

                {!shelfQuery.loading && filteredBooks.length === 0 && (
                  <div className="rounded-3xl bg-base-200 p-8 text-center text-base-content/70">
                    No books found on your shelf yet. Add a book to see it here.
                  </div>
                )}

                {!shelfQuery.loading && filteredBooks.map(book => (
                  <BookCard
                    key={book.google_books_id}
                    title={book.title}
                    titleLink={`/book/${book.google_books_id}`}
                    author={book.author}
                    coverUrl={book.cover_url}
                    topRight={activeTab === 'All' ? <span className="badge badge-outline">{formatShelfStatus(book.status)}</span> : undefined}
                    className="shadow-sm"
                  />
                ))}
              </div>
            </PageCard>
          </section>

          <aside className="space-y-8">
            {currentReadingBook && (
              <PageCard>
                <PageSectionHeader
                  label="Currently Reading"
                  heading={null}
                />
                <div className="block rounded-3xl bg-base-100 p-5 transition hover:shadow-lg">
                  {currentReadingBook.cover_url
                    ? (
                        <CoverImage
                          src={currentReadingBook.cover_url}
                          alt={currentReadingBook.title}
                          className="w-full rounded-3xl aspect-[2/3]"
                        />
                      )
                    : (
                        <div className="w-full rounded-3xl aspect-[2/3] bg-pink-100" />
                      )}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold">
                      <Link
                        to={`/book/${currentReadingBook.google_books_id}`}
                        className="hover:underline"
                      >
                        {currentReadingBook.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-base-content/70">
                      by
                      {' '}
                      {currentReadingBook.author}
                    </p>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm text-base-content/70">
                        {readingProgress}
                        {' % complete'}
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={handleOpenProgressSheet}
                      >
                        Update Progress
                      </button>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-base-200">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${readingProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </PageCard>
            )}

            <PageCard>
              <PageSectionHeader
                label="Community Updates"
                heading="Latest activity"
                right={<Users size={24} className="text-primary" />}
              />
              <div className="space-y-4">
                {communityUpdates.map(update => (
                  <div key={update.name} className="flex items-center gap-4 rounded-3xl bg-base-100 p-4">
                    <div className="avatar">
                      <div className="w-12 rounded-full bg-pink-200 text-center leading-12 text-lg font-bold text-pink-700">
                        {update.name[0]}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold text-base-content">{update.name}</span>
                        {' '}
                        {update.action}
                      </p>
                      <p className="text-xs text-base-content/60">{update.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </PageCard>
          </aside>
        </div>
      </main>

      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box rounded-3xl bg-base-100 shadow-xl">
            <h3 className="text-2xl font-bold">Add a new book</h3>
            <p className="py-4 text-base-content/70">
              Add your next chapter to the Bookify collection and keep your reading list up to date.
            </p>
            <div className="space-y-4">
              <input type="text" placeholder="Book title" className="input input-bordered w-full" />
              <input type="text" placeholder="Author" className="input input-bordered w-full" />
              <textarea placeholder="Notes" className="textarea textarea-bordered w-full" rows={4} />
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={() => setIsModalOpen(false)}>
                Save Book
              </button>
            </div>
          </div>
        </div>
      )}

      {isProgressSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-base-content/60"
            onClick={handleCancelProgress}
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-base-100 p-6 shadow-2xl">
            <h2 className="text-xl font-bold">Update Progress</h2>
            <div className="mt-5 flex flex-col items-center gap-6">
              <div className="text-5xl font-bold text-base-content">
                {draftProgress}
                {' %'}
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={draftProgress}
                onChange={event => setDraftProgress(Number(event.target.value))}
                className="range range-primary w-full"
              />
            </div>
            <div className="mt-6 flex gap-3">
              <button type="button" className="btn btn-ghost grow" onClick={handleCancelProgress}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary grow" onClick={handleSaveProgress}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
