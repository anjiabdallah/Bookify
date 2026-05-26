import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import AuthPageShell from '../components/AuthPageShell';
import FormField from '../components/FormField';
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
    <AuthPageShell
      subtitle="Create your account"
      error={registerRequest.error}
      footerText="Already have an account?"
      footerLinkText="Login"
      footerLinkTo="/login"
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
          id="username"
          label="Username"
          type="text"
          placeholder="bookworm123"
          {...register('username')}
          error={usernameError}
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
          {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Create Account'}
        </button>
      </form>
    </AuthPageShell>
  );
}

export default RegisterPage;
