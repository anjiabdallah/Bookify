import { BookOpen } from 'lucide-react';

import BackButton from '../components/BackButton';

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <main className="container mx-auto relative flex min-h-screen items-center justify-center px-6 py-10">
        <div className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-primary/10 bg-white/80 p-10 text-center shadow-[0_40px_90px_rgba(168,85,247,0.12)] backdrop-blur-lg">
          <div className="pointer-events-none absolute left-6 top-8 text-2xl text-primary/40">✦</div>
          <div className="pointer-events-none absolute right-8 top-16 text-2xl text-primary/40">✧</div>
          <div className="pointer-events-none absolute left-10 bottom-10 text-2xl text-primary/40">✦</div>
          <p className="text-9xl font-serif font-black text-primary leading-none">404</p>
          <p className="mt-4 text-3xl font-semibold text-base-content">Page not found</p>
          <p className="mt-4 text-base text-base-content/70">🦋</p>
          <div className="mt-4 space-y-2 text-base text-base-content/70">
            <p>This page seems to have vanished like a fairy's whisper...</p>
            <p>Let's get you back to a better chapter.</p>
          </div>
          <BackButton to="/" className="btn-primary mt-10 inline-flex rounded-full px-8 py-3 text-base">
            <BookOpen size={18} />
            Back to Home
          </BackButton>
        </div>
      </main>
    </div>
  );
}

export default NotFoundPage;
