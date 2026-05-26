import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import PageCard from '../components/PageCard';
import ProfileDisplayView from '../components/ProfileDisplayView';
import ProfileEditForm from '../components/ProfileEditForm';
import ProfileHeader from '../components/ProfileHeader';
import { useAuth } from '../context/useAuth';
import { useAsync } from '../hooks/useAsync';
import { profileFormSchema, type ProfileFormData } from '../lib/profile.tsx';
import { requestServer } from '../lib/requestServer';

import type { ProfileResponse } from '../../../server/src/api/types';

function ProfilePage() {
  const navigate = useNavigate();
  const { user, token, setAuth, logout } = useAuth();
  const profileLoader = useAsync<ProfileResponse>();
  const profileSaver = useAsync<ProfileResponse>();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      age: undefined,
      bio: undefined,
      favoriteCategories: [],
    },
  });

  const favoriteCategories
    = useWatch({
      control,
      name: 'favoriteCategories',
      defaultValue: [],
    }) ?? [];

  const profile = profileLoader.data ?? {
    age: user?.age ?? null,
    bio: user?.bio ?? null,
    favoriteCategories: user?.favoriteCategories ?? [],
  };

  const resetFormValues = (data: ProfileResponse | null | undefined) => {
    const source = data ?? profile;
    setValue('age', source?.age ? String(source.age) : '');
    setValue('bio', source?.bio ?? '');
    setValue('favoriteCategories', source?.favoriteCategories ?? []);
  };

  useEffect(() => {
    if (!token) return;

    profileLoader
      .execute(() => requestServer<ProfileResponse>('/api/auth/profile'))
      .then((data) => {
        if (data) {
          resetFormValues(data);
        }
      });
  }, [token]);

  useEffect(() => {
    if (profileLoader.data) {
      resetFormValues(profileLoader.data);
    }
  }, [profileLoader.data]);

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
      setAuth(
        {
          ...user,
          age: data.age,
          bio: data.bio ?? null,
          favoriteCategories: data.favoriteCategories ?? [],
        },
        token,
      );
      setIsEditing(false);
    }
  };

  const ageError = useMemo(() => errors.age?.message, [errors.age]);
  const bioError = useMemo(() => errors.bio?.message, [errors.bio]);

  if (!user) {
    return (
      <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center p-4">
        <div className="card bg-base-200 shadow-md w-full max-w-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            You need to log in to access your profile.
          </h2>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <main className="container mx-auto px-6 py-10">
        <PageCard variant="bordered" className="p-8">
          <ProfileHeader username={user.username} onLogout={logout} />

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

          {isEditing
            ? (
                <ProfileEditForm
                  register={register}
                  handleSubmit={handleSubmit}
                  setValue={setValue}
                  favoriteCategories={favoriteCategories}
                  ageError={ageError}
                  bioError={bioError}
                  isSubmitting={isSubmitting}
                  onSubmit={onSubmit}
                  onCancel={() => {
                    resetFormValues(profileLoader.data);
                    setIsEditing(false);
                  }}
                />
              )
            : (
                <ProfileDisplayView profile={profile} onEdit={() => setIsEditing(true)} />
              )}
        </PageCard>
      </main>
    </div>
  );
}

export default ProfilePage;
