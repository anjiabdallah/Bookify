import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import PageCard from '../components/PageCard';
import ProfileDisplayView from '../components/profile/ProfileDisplayView';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import ProfileHeader from '../components/profile/ProfileHeader';
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
  const [savedProfile, setSavedProfile] = useState<ProfileResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [selectedAvatarPreviewUrl, setSelectedAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

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

  const profile = savedProfile ?? profileLoader.data ?? {
    age: user?.age ?? null,
    bio: user?.bio ?? null,
    favoriteCategories: user?.favoriteCategories ?? [],
    profileImageUrl: user?.profileImageUrl ?? undefined,
  };

  const resetFormValues = (data: ProfileResponse | null | undefined) => {
    const source = data ?? profile;
    setValue('age', source?.age ? String(source.age) : '');
    setValue('bio', source?.bio ?? '');
    setValue('favoriteCategories', source?.favoriteCategories ?? []);
    setSelectedAvatarFile(null);
    setSelectedAvatarPreviewUrl(null);
    setAvatarError(null);
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
      setSavedProfile(profileLoader.data);
    }
  }, [profileLoader.data]);

  useEffect(() => {
    if (!selectedAvatarFile) {
      setSelectedAvatarPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedAvatarFile);
    setSelectedAvatarPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedAvatarFile]);

  const handleAvatarSelect = (file: File | null) => {
    if (!file) {
      setSelectedAvatarFile(null);
      setAvatarError(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file.');
      setSelectedAvatarFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be 5 MB or smaller.');
      setSelectedAvatarFile(null);
      return;
    }

    setAvatarError(null);
    setSelectedAvatarFile(file);
  };

  const onSubmit = async (values: ProfileFormData) => {
    const payload = {
      age: values.age ? Number(values.age) : null,
      bio: values.bio ?? null,
      favorite_categories: values.favoriteCategories ?? [],
    };

    let data = await profileSaver.execute(() =>
      requestServer<ProfileResponse>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    );

    if (selectedAvatarFile) {
      const formData = new FormData();
      formData.append('profileImage', selectedAvatarFile);

      data = await profileSaver.execute(() =>
        requestServer<ProfileResponse>('/api/auth/profile/avatar', {
          method: 'POST',
          body: formData,
        }),
      );
    }

    if (data && user && token) {
      setAuth(
        {
          ...user,
          age: data.age,
          bio: data.bio ?? null,
          favoriteCategories: data.favoriteCategories ?? [],
          profileImageUrl: data.profileImageUrl ?? null,
        },
        token,
      );
      setSavedProfile(data);
      setSelectedAvatarFile(null);
      setSelectedAvatarPreviewUrl(null);
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
          <ProfileHeader
            username={user.username}
            avatarUrl={profile.profileImageUrl}
            onLogout={logout}
          />

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
                  avatarError={avatarError ?? undefined}
                  isSubmitting={isSubmitting}
                  currentAvatarUrl={profile.profileImageUrl}
                  selectedAvatarPreviewUrl={selectedAvatarPreviewUrl}
                  onAvatarSelect={handleAvatarSelect}
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
