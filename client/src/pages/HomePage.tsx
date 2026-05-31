import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import SearchBar from '../components/ui/SearchBar';
import { useAuth } from '../context/useAuth';

function HomePage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-base-100 text-base-content">
        <section className="hero min-h-screen bg-base-200 rounded-b-[3rem]">
          <div className="hero-content flex-col lg:flex-row gap-16 px-8 py-20">
            <div className="max-w-2xl">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <main className="container mx-auto px-6 py-10">
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
      </main>
    </div>
  );
}

export default HomePage;
