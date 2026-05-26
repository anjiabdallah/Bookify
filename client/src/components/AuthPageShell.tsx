import { BookOpen } from 'lucide-react';
import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

type AuthPageShellProps = {
  subtitle: string;
  error?: string | null;
  footerText: string;
  footerLinkText: string;
  footerLinkTo: string;
  children: ReactNode;
};

function AuthPageShell({
  subtitle,
  error,
  footerText,
  footerLinkText,
  footerLinkTo,
  children,
}: AuthPageShellProps) {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 shadow-md w-full max-w-[400px] mx-auto">
        <div className="card-body">
          <div className="flex items-center gap-2 justify-center mb-4">
            <BookOpen size={32} className="text-primary" />
            <h1 className="text-3xl font-bold text-primary">Bookify</h1>
          </div>
          <h2 className="text-xl font-semibold text-center mb-6">{subtitle}</h2>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          {children}

          <p className="text-center text-sm mt-4">
            {footerText}
            {' '}
            <Link to={footerLinkTo} className="text-primary font-semibold hover:underline">
              {footerLinkText}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPageShell;
