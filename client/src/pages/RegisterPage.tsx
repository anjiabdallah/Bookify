import { BookOpen } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/useAuth';

function RegisterPage() {
  const { setAuth } = useAuth();
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      setAuth(data.user, data.token);
      window.location.href = '/';
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 shadow-md w-full max-w-md">
        <div className="card-body">
          <div className="flex items-center gap-2 justify-center mb-4">
            <BookOpen size={32} className="text-primary" />
            <h1 className="text-3xl font-bold text-primary">Bookify</h1>
          </div>
          <h2 className="text-xl font-semibold text-center mb-6">Create your account</h2>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="form-control">
              <div className="label">
                <span className="label-text">Email</span>
              </div>
              <input
                type="email"
                placeholder="you@example.com"
                className="input input-bordered"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Username</span>
              </div>
              <input
                type="text"
                placeholder="bookworm123"
                className="input input-bordered"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Password</span>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="input input-bordered"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary mt-2"
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner loading-sm" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            Already have an account?
            {' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
