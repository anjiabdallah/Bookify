import { Cake, CheckCircle2, Sparkles } from 'lucide-react';
import type { UseFormHandleSubmit, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import type { ProfileFormData } from '../lib/profile.tsx';
import { categories, categoryIcons } from '../lib/profile.tsx';

type ProfileEditFormProps = {
  register: UseFormRegister<ProfileFormData>;
  handleSubmit: UseFormHandleSubmit<ProfileFormData>;
  setValue: UseFormSetValue<ProfileFormData>;
  favoriteCategories: string[];
  ageError?: string;
  bioError?: string;
  isSubmitting: boolean;
  onSubmit: (values: ProfileFormData) => Promise<void>;
  onCancel: () => void;
};

function ProfileEditForm({
  register,
  handleSubmit,
  setValue,
  favoriteCategories,
  ageError,
  bioError,
  isSubmitting,
  onSubmit,
  onCancel,
}: ProfileEditFormProps) {
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="relative">
          <label className="label">
            <span className="label-text font-medium">Age</span>
          </label>
          <input
            type="number"
            min="13"
            max="120"
            placeholder="Your age (13-120)"
            className="input input-bordered w-full bg-base-100 pr-12"
            {...register('age')}
          />
          <Cake
            size={20}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-primary/40"
          />
          {ageError && (
            <span className="mt-2 block text-sm text-error">{ageError}</span>
          )}
        </div>
      </div>

      <div>
        <p className="label-text mb-4 block text-sm font-medium">
          Favorite categories
        </p>
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
                      ? favoriteCategories.filter((item) => item !== category)
                      : [...favoriteCategories, category],
                  );
                }}
              >
                <div className="flex items-center gap-3">
                  <span>{categoryIcons[category]}</span>
                  <span className="text-sm font-medium">{category}</span>
                </div>
                {selected ? (
                  <CheckCircle2 size={18} className="text-primary" />
                ) : null}
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
        <div className="pointer-events-none absolute bottom-4 right-4 text-2xl text-primary/10">
          ✿
        </div>
        {bioError && (
          <span className="mt-2 block text-sm text-error">{bioError}</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="btn btn-primary inline-flex items-center gap-2"
          disabled={isSubmitting}
        >
          <Sparkles size={18} />
          {isSubmitting ? 'Saving...' : 'Save Profile'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ProfileEditForm;
