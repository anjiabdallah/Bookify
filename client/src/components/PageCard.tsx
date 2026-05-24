import { type ReactNode } from 'react';

type PageCardProps = {
  children: ReactNode;
  className?: string;
  variant?: 'surface' | 'bordered';
};

function PageCard({ children, className = '', variant = 'surface' }: PageCardProps) {
  const base = variant === 'bordered'
    ? 'rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm'
    : 'rounded-3xl bg-base-200 p-8 shadow-sm';

  return <div className={`${base} ${className}`.trim()}>{children}</div>;
}

export default PageCard;
