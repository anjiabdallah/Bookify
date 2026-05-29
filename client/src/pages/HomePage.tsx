import { BookOpen, Users, Plus, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import BookCard from '../components/book/BookCard';
import PageCard from '../components/ui/PageCard';
import PageSectionHeader from '../components/ui/PageSectionHeader';
import SearchBar from '../components/ui/SearchBar';
import StarRating from '../components/ui/StarRating';
import { useAuth } from '../context/useAuth';

const trendingBooks = [
  { title: 'Moonlit Tales', author: 'Ava Hart', rating: 4.8 },
  { title: 'Whispered Spells', author: 'Luna Vale', rating: 4.6 },
  { title: 'Spring of Secrets', author: 'Mara Finch', rating: 4.7 },
  { title: 'Velvet Pages', author: 'Eden Gray', rating: 4.5 },
];

const genres = [
  'Fantasy',
  'Romance',
  'YA',
  'Mystery',
  'Historical',
  'Romantasy',
];

const myBooks = [
  { title: 'A Wild Ember', author: 'June Hart', status: 'Reading' },
  { title: 'Petals of Fate', author: 'Noor Lane', status: 'Want to Read' },
  { title: 'Midnight Letters', author: 'Sia Brooks', status: 'Read' },
  { title: 'Celestial Ink', author: 'Milo Reed', status: 'All' },
];

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
  const navigate = useNavigate();

  const filteredBooks = myBooks.filter(book => activeTab === 'All' || book.status === activeTab);

  if (!user) {
    return (
      <div className="min-h-screen bg-base-100 text-base-content">
        <section className="hero min-h-screen bg-base-200 rounded-b-[3rem]">
          <div className="hero-content flex-col lg:flex-row gap-16 px-8 py-20">
            <div className="max-w-2xl">
              <div className="badge badge-primary badge-lg mb-6">Bookify</div>
              <h1 className="text-5xl font-bold">Where stories take wing.</h1>
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
            <div className="w-full max-w-xl rounded-3xl bg-base-100 p-8 shadow-xl">
              <div className="grid gap-6">
                <div className="bg-pink-100 rounded-3xl p-6">
                  <div className="text-xs uppercase tracking-[0.3em] text-pink-600 mb-4">Featured Story</div>
                  <div className="h-64 rounded-3xl bg-pink-200" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-base-content/80">
                  <div className="rounded-3xl bg-base-200 p-4">
                    <div className="font-semibold">Daily picks</div>
                    <p className="mt-2">Curated reads for your next cozy night.</p>
                  </div>
                  <div className="rounded-3xl bg-base-200 p-4">
                    <div className="font-semibold">Magic meter</div>
                    <p className="mt-2">Track your bookish spark all week.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <main className="container mx-auto px-6 py-16">
          <section className="mb-16">
            <PageSectionHeader
              label="Trending This Week"
              heading="Readers are loving"
              right={(
                <button className="btn btn-ghost btn-sm gap-2">
                  See All
                  {' '}
                  <ChevronRight size={18} />
                </button>
              )}
            />
            <div className="flex gap-4 overflow-x-auto pb-2">
              {trendingBooks.map(book => (
                <BookCard
                  key={book.title}
                  title={book.title}
                  author={book.author}
                  className="w-80 shrink-0"
                >
                  <div className="h-56 rounded-3xl bg-pink-100" />
                  <p className="mt-6 text-sm text-base-content/70">{book.author}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-primary">
                    <StarRating value={book.rating} />
                    <span>{book.rating.toFixed(1)}</span>
                  </div>
                </BookCard>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <PageSectionHeader
              label="Browse by Genre"
              heading="Find your next adventure"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {genres.map((genre, index) => (
                <div
                  key={genre}
                  className={`card rounded-3xl p-8 text-white ${
                    index % 3 === 0 ? 'bg-pink-500' : index % 3 === 1 ? 'bg-purple-500' : 'bg-rose-500'
                  }`}
                >
                  <div className="card-body">
                    <div className="text-3xl font-bold">{genre}</div>
                    <p className="mt-4 text-sm opacity-90">A world of pages waiting to be opened.</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <PageCard>
            <div className="grid gap-6 sm:grid-cols-4 text-center">
              <div>
                <p className="text-3xl font-bold">2.5M+</p>
                <p className="text-sm text-base-content/80">Book lovers</p>
              </div>
              <div>
                <p className="text-3xl font-bold">12.7M+</p>
                <p className="text-sm text-base-content/80">Books added</p>
              </div>
              <div>
                <p className="text-3xl font-bold">98K+</p>
                <p className="text-sm text-base-content/80">Lists created</p>
              </div>
              <div>
                <p className="text-3xl font-bold">Daily magic</p>
                <p className="text-sm text-base-content/80">One page at a time.</p>
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
        <div className="grid gap-8 lg:grid-cols-[1.7fr_0.9fr]">
          <section className="space-y-8">
            <div className="rounded-3xl bg-base-200 p-8 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-primary">
                    Welcome back,
                    {user.username}
                    ! ✨
                  </p>
                  <h1 className="text-4xl font-bold">Your reading haven awaits.</h1>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button className="btn btn-primary gap-2" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} />
                    {' '}
                    Add a Book
                  </button>
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
                {['All', 'Reading', 'Read', 'Want to Read'].map(tab => (
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
                {filteredBooks.map(book => (
                  <BookCard
                    key={book.title}
                    title={book.title}
                    author={book.author}
                    topRight={<span className="badge badge-outline">{book.status}</span>}
                    className="shadow-sm"
                  />
                ))}
              </div>
            </PageCard>
          </section>

          <aside className="space-y-8">
            <PageCard>
              <PageSectionHeader
                label="Currently Reading"
                heading="The Starlight Journal"
                right={<BookOpen size={28} className="text-primary" />}
              />
              <div className="rounded-3xl bg-base-100 p-5">
                <div className="h-52 rounded-3xl bg-pink-100" />
                <div className="mt-6">
                  <h3 className="text-lg font-semibold">The Starlight Journal</h3>
                  <p className="text-sm text-base-content/70">by Rowan Pierce</p>
                </div>
                <div className="mt-6">
                  <progress className="progress progress-primary w-full" value={62} max={100} />
                  <div className="mt-3 flex items-center justify-between text-sm text-base-content/70">
                    <span>62% complete</span>
                    <span>7/18 chapters</span>
                  </div>
                </div>
                <button className="btn btn-primary btn-block mt-6">Update Progress</button>
              </div>
            </PageCard>

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
    </div>
  );
}

export default HomePage;
