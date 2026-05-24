import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import { useAuth } from '../context/useAuth';
import { useAsync } from '../hooks/useAsync';
import { requestServer } from '../lib/requestServer';

import type { ProfileResponse } from '../../../server/src/api/types';

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

const profileSchema = z.object({
  age: z.string().optional(),
  bio: z.string().max(500).optional(),
  favoriteCategories: z.array(z.string()).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

function ProfilePage() {
  const { user, token, setAuth, logout } = useAuth();
  const profileLoader = useAsync<ProfileResponse>();
  const profileSaver = useAsync<ProfileResponse>();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age: undefined,
      bio: undefined,
      favoriteCategories: [],
    },
  });

  const favoriteCategories = useWatch({
    control,
    name: 'favoriteCategories',
    defaultValue: [],
  }) ?? [];

  useEffect(() => {
    if (!token) return;

    profileLoader.execute(() => requestServer<ProfileResponse>('/api/auth/profile')).then((data) => {
      if (data) {
        setValue('age', data.age ? String(data.age) : '');
        setValue('bio', data.bio ?? '');
        setValue('favoriteCategories', data.favoriteCategories ?? []);
      }
    });
  }, [token, setValue]);

  const onSubmit = async (values: ProfileFormData) => {
    const payload = {
      age: values.age ? Number(values.age) : null,
      bio: values.bio ?? null,
      favorite_categories: values.favoriteCategories ?? [],
    };

    const data = await profileSaver.execute(() =>
      requestServer<ProfileResponse>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    );

    if (data && user && token) {
      setAuth({ ...user, age: data.age, bio: data.bio ?? null, favoriteCategories: data.favoriteCategories ?? [] }, token);
    }
  };

  const ageError = useMemo(() => errors.age?.message, [errors.age]);
  const bioError = useMemo(() => errors.bio?.message, [errors.bio]);

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
              <h1 className="text-4xl font-bold">
                Hi,
                {user.username}
              </h1>
              <p className="text-base-content/70">Add your age, favorite categories, and a short bio.</p>
            </div>
            <button onClick={logout} className="btn btn-ghost btn-sm">
              Logout
            </button>
          </div>

          {(profileLoader.error || profileSaver.error) && (
            <div className="alert alert-error mb-4">
              <span>{profileSaver.error ?? profileLoader.error}</span>
            </div>
          )}

          {profileSaver.data && (
            <div className="alert alert-success mb-4">
              <span>Profile saved successfully.</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <label className="form-control w-full">
              <span className="label-text">Age</span>
              <input
                type="number"
                min="1"
                placeholder="Your age"
                className="input input-bordered w-full"
                {...register('age')}
              />
              {ageError && <span className="text-sm text-error mt-1">{ageError}</span>}
            </label>

            <div>
              <p className="label-text mb-3 block text-sm font-medium">Favorite categories</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map(category => (
                  <button
                    type="button"
                    key={category}
                    className={`btn btn-outline justify-start ${favoriteCategories.includes(category) ? 'btn-primary text-white' : ''}`}
                    onClick={() => {
                      setValue(
                        'favoriteCategories',
                        favoriteCategories.includes(category)
                          ? favoriteCategories.filter(item => item !== category)
                          : [...favoriteCategories, category],
                      );
                    }}
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
                {...register('bio')}
                rows={5}
              />
              {bioError && <span className="text-sm text-error mt-1">{bioError}</span>}
            </label>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
