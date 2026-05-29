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
    firstName: z
      .string()
      .min(2, { message: 'First name must be at least 2 characters' })
      .max(50, { message: 'First name must be at most 50 characters' }),
    lastName: z
      .string()
      .min(2, { message: 'Last name must be at least 2 characters' })
      .max(50, { message: 'Last name must be at most 50 characters' }),
    email: z.string().email({ message: 'Enter a valid email address' }),
    username: z
      .string()
      .min(4, { message: 'Username must be at least 4 characters' })
      .max(20, { message: 'Username must be at most 20 characters' }),
    gender: z.enum(['female', 'male', 'other', 'prefer_not_to_say'] as const, {
      error: 'Select your gender',
    }),
    password: passwordRequirement,
    confirmPassword: z.string().min(1, { message: 'Confirm your password' }),
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
      } else if (message.includes('Passwords do not match') || message.includes('Confirm your password')) {
        setError('confirmPassword', { type: 'server', message });
      } else if (message.includes('Password')) {
        setError('password', { type: 'server', message });
      } else if (message.includes('First name')) {
        setError('firstName', { type: 'server', message });
      } else if (message.includes('Last name')) {
        setError('lastName', { type: 'server', message });
      } else if (message.includes('Gender')) {
        setError('gender', { type: 'server', message });
      }
    }

    if (data) {
      setAuth(data.user, data.token);
      navigate('/');
    }
  };

  const firstNameError = useMemo(() => errors.firstName?.message, [errors.firstName]);
  const lastNameError = useMemo(() => errors.lastName?.message, [errors.lastName]);
  const emailError = useMemo(() => errors.email?.message, [errors.email]);
  const usernameError = useMemo(() => errors.username?.message, [errors.username]);
  const genderError = useMemo(() => errors.gender?.message, [errors.gender]);
  const passwordError = useMemo(() => errors.password?.message, [errors.password]);
  const confirmPasswordError = useMemo(
    () => errors.confirmPassword?.message,
    [errors.confirmPassword],
  );

  const registerFieldErrorMapped = [
    'Email',
    'Username',
    'Passwords do not match',
    'Confirm your password',
    'Password',
    'First name',
    'Last name',
    'Gender',
  ].some(keyword => registerRequest.error?.includes(keyword));

  return (
    <AuthPageShell
      subtitle="Create your account"
      error={registerFieldErrorMapped ? undefined : registerRequest.error}
      footerText="Already have an account?"
      footerLinkText="Login"
      footerLinkTo="/login"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-x-3 gap-y-1 w-full md:grid-cols-2">
        <div>
          <FormField
            id="firstName"
            label="First Name"
            type="text"
            placeholder="Jane"
            className="input-sm"
            {...register('firstName')}
            error={firstNameError}
          />
        </div>

        <div>
          <FormField
            id="lastName"
            label="Last Name"
            type="text"
            placeholder="Doe"
            className="input-sm"
            {...register('lastName')}
            error={lastNameError}
          />
        </div>

        <div>
          <FormField
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            className="input-sm"
            {...register('email')}
            error={emailError}
          />
        </div>

        <div>
          <FormField
            id="username"
            label="Username"
            type="text"
            placeholder="bookworm123"
            className="input-sm"
            {...register('username')}
            error={usernameError}
          />
        </div>

        <div>
          <FormField
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            className="input-sm"
            {...register('password')}
            error={passwordError}
          />
        </div>

        <div>
          <FormField
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            className="input-sm"
            {...register('confirmPassword')}
            error={confirmPasswordError}
          />
        </div>
        <div className="md:col-span-2 flex flex-col gap-2 w-full">
          <label htmlFor="gender" className="text-sm font-medium">
            Gender
          </label>
          <select
            id="gender"
            className="select select-bordered select-sm w-full"
            {...register('gender')}
          >
            <option value="">Select gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
          <div className="min-h-10">
            {genderError ? <span className="text-sm text-error mt-1 block">{genderError}</span> : null}
          </div>
        </div>

        <div className="md:col-span-2">
          <button type="submit" className="btn btn-primary btn-sm w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Create Account'}
          </button>
        </div>
      </form>
    </AuthPageShell>
  );
}

export default RegisterPage;
