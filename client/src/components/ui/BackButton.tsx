import { ArrowLeft } from 'lucide-react';
import { type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type BackButtonProps = {
  to?: string;
  children?: ReactNode;
  className?: string;
  showIcon?: boolean;
};

function BackButton({
  to,
  children = 'Back',
  className = '',
  showIcon = true,
}: BackButtonProps) {
  const navigate = useNavigate();
  const content = (
    <>
      {showIcon ? <ArrowLeft size={16} /> : null}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`btn btn-sm inline-flex items-center gap-2 ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => navigate(-1)} className={`btn btn-sm inline-flex items-center gap-2 ${className}`}>
      {content}
    </button>
  );
}

export default BackButton;
