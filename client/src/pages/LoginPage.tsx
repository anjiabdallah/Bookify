import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen } from 'lucide-react';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useAuth } from '../context/authContext';
import { useAsync } from '../hooks/useAsync';
import { requestServer } from '../lib/requestServer';

import type { LoginResponse } from '../../../server/src/api/types';

const loginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const login = useAsync<LoginResponse>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (values: LoginFormData) => {
    const data = await login.execute(() =>
      requestServer<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(values),
      }),
    );

    if (data) {
      setAuth(data.user, data.token);
      navigate('/');
    }
  };

  const emailError = useMemo(() => errors.email?.message, [errors.email]);
  const passwordError = useMemo(() => errors.password?.message, [errors.password]);

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

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <label className="form-control">
              <div className="label">
                <span className="label-text">Email</span>
              </div>
              <input
                type="email"
                placeholder="you@example.com"
                className="input input-bordered"
                {...register('email')}
              />
              {emailError && <span className="text-sm text-error mt-1">{emailError}</span>}
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Password</span>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="input input-bordered"
                {...register('password')}
              />
              {passwordError && <span className="text-sm text-error mt-1">{passwordError}</span>}
            </label>

            <button type="submit" className="btn btn-primary mt-2" disabled={isSubmitting}>
              {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Login'}
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
