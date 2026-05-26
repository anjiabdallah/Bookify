import { LogOut } from 'lucide-react';

type ProfileHeaderProps = {
  username: string;
  onLogout: () => void;
};

function ProfileHeader({ username, onLogout }: ProfileHeaderProps) {
  return (
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
            Hi, {username}
            <span className="text-primary"> ✦</span>
          </h1>
          <p className="mt-3 max-w-xl text-base text-base-content/70">
            Add your age, favorite categories, and a short bio.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-start gap-4 sm:items-end">
        <div className="text-primary/20 text-4xl">✿</div>
        <button onClick={onLogout} className="btn btn-ghost btn-sm text-primary gap-2">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default ProfileHeader;
