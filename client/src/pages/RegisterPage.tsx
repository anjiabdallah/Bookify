import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import AuthPageShell from '../components/AuthPageShell';
import FormField from '../components/ui/FormField';
import { useAuth } from '../context/useAuth';
import { useAsync } from '../hooks/useAsync';
import { requestServer } from '../lib/requestServer';

import type { RegisterResponse } from '../../../server/src/api/types';

const passwordRequirement = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .refine(value => /[A-Z]/.test(value), {
    message: 'Password must include at least one uppercase letter',
  })
  .refine(value => /[a-z]/.test(value), {
    message: 'Password must include at least one lowercase letter',
  })
  .refine(value => /\d/.test(value), {
    message: 'Password must include at least one number',
  })
  .refine(value => /[\W_]/.test(value), {
    message: 'Password must include at least one special character',
  });

const registerSchema = z
  .object({
    email: z.string().email({ message: 'Enter a valid email address' }),
    username: z
      .string()
      .min(4, { message: 'Username must be at least 4 characters' })
      .max(20, { message: 'Username must be at most 20 characters' }),
    password: passwordRequirement,
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      });
    }
  });

type RegisterFormData = z.infer<typeof registerSchema>;

function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const registerRequest = useAsync<RegisterResponse>();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const onSubmit = async (values: RegisterFormData) => {
    const data = await registerRequest.execute(() =>
      requestServer<RegisterResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(values),
      }),
    );

    if (!data && registerRequest.error) {
      const message = registerRequest.error;
      if (message.includes('Email')) {
        setError('email', { type: 'server', message });
      } else if (message.includes('Username')) {
        setError('username', { type: 'server', message });
      } else if (message.includes('Password')) {
        setError('password', { type: 'server', message });
      }
    }

    if (data) {
      setAuth(data.user, data.token);
      navigate('/');
    }
  };

  const emailError = useMemo(() => errors.email?.message, [errors.email]);
  const usernameError = useMemo(() => errors.username?.message, [errors.username]);
  const passwordError = useMemo(() => errors.password?.message, [errors.password]);
  const confirmPasswordError = useMemo(
    () => errors.confirmPassword?.message,
    [errors.confirmPassword],
  );

  const registerFieldErrorMapped = ['Email', 'Username', 'Password'].some(keyword =>
    registerRequest.error?.includes(keyword),
  );

  return (
    <AuthPageShell
      subtitle="Create your account"
      error={registerFieldErrorMapped ? undefined : registerRequest.error}
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

        <FormField
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          {...register('confirmPassword')}
          error={confirmPasswordError}
        />

        <button type="submit" className="btn btn-primary w-full mt-2" disabled={isSubmitting}>
          {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Create Account'}
        </button>
      </form>
    </AuthPageShell>
  );
}

export default RegisterPage;
