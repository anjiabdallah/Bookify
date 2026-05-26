import PageCard from '../PageCard';

import type { ProfileResponse } from '../../../../server/src/api/types';

type ProfileDisplayProfile = {
  age: number | null;
  bio?: string | null | undefined;
  favoriteCategories?: string[] | null | undefined;
};

type ProfileDisplayViewProps = {
  profile: ProfileResponse | ProfileDisplayProfile;
  onEdit: () => void;
};

function ProfileDisplayView({ profile, onEdit }: ProfileDisplayViewProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Your profile</h2>
          <p className="text-sm text-base-content/70">Review your stored information and edit anytime.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={onEdit}>
          Edit Profile
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <PageCard variant="bordered" className="space-y-4 shadow-none">
          <div>
            <div className="text-sm font-semibold text-base-content/70">Age</div>
            <div>{profile.age ? `${profile.age} years` : 'Not set'}</div>
          </div>

          <div>
            <div className="text-sm font-semibold text-base-content/70">Favorite categories</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.favoriteCategories && profile.favoriteCategories.length > 0
                ? (
                    profile.favoriteCategories.map(category => (
                      <span key={category} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                        {category}
                      </span>
                    ))
                  )
                : (
                    <span className="text-sm text-base-content/70">No categories selected</span>
                  )}
            </div>
          </div>
        </PageCard>

        <PageCard variant="bordered" className="space-y-4 shadow-none">
          <div>
            <div className="text-sm font-semibold text-base-content/70">About you</div>
            <p className="mt-2 text-base text-base-content/80">
              {profile.bio ? profile.bio : 'No bio added yet.'}
            </p>
          </div>
        </PageCard>
      </div>
    </div>
  );
}

export default ProfileDisplayView;
