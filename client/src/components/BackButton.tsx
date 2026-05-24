import { ArrowLeft } from 'lucide-react';
import { type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type BackButtonProps = {
  to?: string;
  children?: ReactNode;
  className?: string;
};

function BackButton({ to, children = 'Back', className = '' }: BackButtonProps) {
  const navigate = useNavigate();

  if (to) {
    return (
      <Link to={to} className={`btn btn-sm inline-flex items-center gap-2 ${className}`}>
        <ArrowLeft size={16} />
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => navigate(-1)} className={`btn btn-sm inline-flex items-center gap-2 ${className}`}>
      <ArrowLeft size={16} />
      {children}
    </button>
  );
}

export default BackButton;
