import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import AuthPageShell from '../components/AuthPageShell';
import FormField from '../components/FormField';
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
    <AuthPageShell
      subtitle="Welcome back!"
      error={login.error}
      footerText="Don't have an account?"
      footerLinkText="Register"
      footerLinkTo="/register"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          error={emailError}
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          error={passwordError}
        />

        <button type="submit" className="btn btn-primary w-full mt-2" disabled={isSubmitting}>
          {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Login'}
        </button>
      </form>
    </AuthPageShell>
  );
}

export default LoginPage;
