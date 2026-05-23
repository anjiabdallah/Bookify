import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/useAuth';

const categories = [
  'Fantasy',
  'Romance',
  'Mystery',
  'Science Fiction',
  'Historical',
  'Thriller',
  'Young Adult',
  'Nonfiction',
];

function ProfilePage() {
  const { user, token, setAuth, logout } = useAuth();
  const [form, setForm] = useState({
    age: '',
    favoriteCategories: [] as string[],
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    const loadProfile = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch('http://localhost:3001/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Unable to load profile');
          return;
        }

        const data = await res.json();
        setForm({
          age: data.age ? String(data.age) : '',
          favoriteCategories: data.favoriteCategories ?? [],
          bio: data.bio ?? '',
        });
      } catch {
        setError('Could not connect to the server');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('http://localhost:3001/api/auth/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age: form.age ? Number(form.age) : null,
          bio: form.bio || null,
          favorite_categories: form.favoriteCategories,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Could not save profile');
        return;
      }

      setMessage('Profile saved successfully.');
      if (user) {
        setAuth({ ...user, age: data.age, bio: data.bio, favoriteCategories: data.favoriteCategories }, token);
      }
    } catch {
      setError('Could not connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setForm(current => {
      const hasCategory = current.favoriteCategories.includes(category);
      return {
        ...current,
        favoriteCategories: hasCategory
          ? current.favoriteCategories.filter(item => item !== category)
          : [...current.favoriteCategories, category],
      };
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center p-4">
        <div className="card bg-base-200 shadow-md w-full max-w-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">You need to log in to access your profile.</h2>
          <Link to="/login" className="btn btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <main className="container mx-auto px-6 py-10">
        <div className="rounded-3xl bg-base-200 p-8 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-primary">Profile</p>
              <h1 className="text-4xl font-bold">Hi, {user.username}</h1>
              <p className="text-base-content/70">Add your age, favorite categories, and a short bio.</p>
            </div>
            <button onClick={logout} className="btn btn-ghost btn-sm">
              Logout
            </button>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="alert alert-success mb-4">
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <label className="form-control w-full">
              <span className="label-text">Age</span>
              <input
                type="number"
                min="1"
                placeholder="Your age"
                className="input input-bordered w-full"
                value={form.age}
                onChange={e => setForm({ ...form, age: e.target.value })}
              />
            </label>

            <div>
              <p className="label-text mb-3 block text-sm font-medium">Favorite categories</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map(category => (
                  <button
                    type="button"
                    key={category}
                    className={`btn btn-outline justify-start ${form.favoriteCategories.includes(category) ? 'btn-primary text-white' : ''}`}
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <label className="form-control w-full">
              <span className="label-text">About you</span>
              <textarea
                placeholder="Tell other readers a little about your tastes..."
                className="textarea textarea-bordered w-full"
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                rows={5}
              />
            </label>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
