import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen } from 'lucide-react';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useAuth } from '../context/useAuth';
import { useAsync } from '../hooks/useAsync';
import { requestServer } from '../lib/requestServer';

import type { RegisterResponse } from '../../../server/src/api/types';

const registerSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const registerRequest = useAsync<RegisterResponse>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (values: RegisterFormData) => {
    const data = await registerRequest.execute(() =>
      requestServer<RegisterResponse>('/api/auth/register', {
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
  const usernameError = useMemo(() => errors.username?.message, [errors.username]);
  const passwordError = useMemo(() => errors.password?.message, [errors.password]);

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 shadow-md w-full max-w-[400px] mx-auto">
        <div className="card-body">
          <div className="flex items-center gap-2 justify-center mb-4">
            <BookOpen size={32} className="text-primary" />
            <h1 className="text-3xl font-bold text-primary">Bookify</h1>
          </div>
          <h2 className="text-xl font-semibold text-center mb-6">Create your account</h2>

          {registerRequest.error && (
            <div className="alert alert-error mb-4">
              <span>{registerRequest.error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="input input-bordered w-full"
                {...register('email')}
              />
              {emailError && <span className="text-sm text-error mt-1">{emailError}</span>}
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="bookworm123"
                className="input input-bordered w-full"
                {...register('username')}
              />
              {usernameError && <span className="text-sm text-error mt-1">{usernameError}</span>}
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full"
                {...register('password')}
              />
              {passwordError && <span className="text-sm text-error mt-1">{passwordError}</span>}
            </div>

            <button type="submit" className="btn btn-primary w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Create Account'}
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
