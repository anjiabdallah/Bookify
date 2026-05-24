import { BookOpen } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/authContext';
import { useAsync } from '../hooks/useAsync';
import { requestServer } from '../lib/requestServer';

import type { LoginResponse } from '../../../server/src/api/types';

function LoginPage() {
  const { setAuth } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const login = useAsync<LoginResponse>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = await login.execute(() =>
      requestServer<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      }),
    );

    if (data) {
      setAuth(data.user, data.token);
      window.location.href = '/';
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
          <h2 className="text-xl font-semibold text-center mb-6">Welcome back!</h2>

          {login.error && (
            <div className="alert alert-error mb-4">
              <span>{login.error}</span>
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
              disabled={login.loading}
            >
              {login.loading ? <span className="loading loading-spinner loading-sm" /> : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            Don't have an account?
            {' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
