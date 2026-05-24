import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, BookMarked, Cake, CheckCircle2, Heart, Landmark, LogOut, Rocket, Search, Sparkles, Wand2, Zap } from 'lucide-react';
import { useEffect, useMemo, type ReactNode } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
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

const categoryIcons: Record<string, ReactNode> = {
  'Fantasy': <Wand2 size={20} />,
  'Romance': <Heart size={20} />,
  'Mystery': <Search size={20} />,
  'Science Fiction': <Rocket size={20} />,
  'Historical': <Landmark size={20} />,
  'Thriller': <Zap size={20} />,
  'Young Adult': <BookOpen size={20} />,
  'Nonfiction': <BookMarked size={20} />,
};

const profileSchema = z.object({
  age: z.string().optional(),
  bio: z.string().max(500).optional(),
  favoriteCategories: z.array(z.string()).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

function ProfilePage() {
  const navigate = useNavigate();
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
          <button onClick={() => navigate('/login')} className="btn btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <main className="container mx-auto px-6 py-10">
        <div className="rounded-3xl border border-base-200 bg-base-100 p-8 shadow-sm">
          <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="flex items-center gap-5">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 text-primary/40">
                <div className="text-4xl">📚</div>
                <div className="pointer-events-none absolute -top-2 left-2 text-2xl text-primary/20">✦</div>
                <div className="pointer-events-none absolute bottom-2 right-2 text-2xl text-primary/20">✦</div>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.5em] text-primary">
                  PROFILE
                  <sup className="text-primary">+</sup>
                </p>
                <h1 className="mt-4 text-4xl font-bold text-base-content">
                  Hi,
                  <br />
                  {user.username}
                  <br />
                  <span className="text-primary">✦</span>
                </h1>
                <p className="mt-3 max-w-xl text-base text-base-content/70">
                  Add your age, favorite categories, and a short bio.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-4 sm:items-end">
              <div className="text-primary/20 text-4xl">✿</div>
              <button onClick={logout} className="btn btn-ghost btn-sm text-primary gap-2">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>

          {(profileLoader.error || profileSaver.error) && (
            <div className="alert alert-error mb-6">
              <span>{profileSaver.error ?? profileLoader.error}</span>
            </div>
          )}

          {profileSaver.data && (
            <div className="alert alert-success mb-6">
              <span>Profile saved successfully.</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
              <div className="relative">
                <label className="label">
                  <span className="label-text font-medium">Age</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Your age"
                  className="input input-bordered w-full bg-base-100 pr-12"
                  {...register('age')}
                />
                <Cake size={20} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-primary/40" />
                {ageError && <span className="mt-2 block text-sm text-error">{ageError}</span>}
              </div>
            </div>

            <div>
              <p className="label-text mb-4 block text-sm font-medium">Favorite categories</p>
              <div className="grid grid-cols-3 gap-3">
                {categories.map((category) => {
                  const selected = favoriteCategories.includes(category);
                  return (
                    <button
                      type="button"
                      key={category}
                      className={`border rounded-xl px-4 py-3 flex items-center justify-between transition-colors ${
                        selected
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-base-100 border-base-200 text-base-content'
                      }`}
                      onClick={() => {
                        setValue(
                          'favoriteCategories',
                          selected
                            ? favoriteCategories.filter(item => item !== category)
                            : [...favoriteCategories, category],
                        );
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span>{categoryIcons[category]}</span>
                        <span className="text-sm font-medium">{category}</span>
                      </div>
                      {selected ? <CheckCircle2 size={18} className="text-primary" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <label className="label">
                <span className="label-text font-medium">About you</span>
              </label>
              <textarea
                placeholder="Tell other readers a little about your tastes..."
                className="textarea textarea-bordered w-full bg-base-100 pr-10"
                {...register('bio')}
                rows={5}
              />
              <div className="pointer-events-none absolute bottom-4 right-4 text-2xl text-primary/10">✿</div>
              {bioError && <span className="mt-2 block text-sm text-error">{bioError}</span>}
            </div>

            <button type="submit" className="btn btn-primary inline-flex items-center gap-2" disabled={isSubmitting}>
              <Sparkles size={18} />
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
