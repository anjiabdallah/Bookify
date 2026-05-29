import { type ReactNode } from 'react';

type PageSectionHeaderProps = {
  label?: string;
  heading: ReactNode;
  right?: ReactNode;
  className?: string;
};

function PageSectionHeader({
  label,
  heading,
  right,
  className = '',
}: PageSectionHeaderProps) {
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6 ${className}`}>
      <div>
        {label
          ? (
              <>
                <p className="text-sm uppercase tracking-[0.3em] text-primary">{label}</p>
                <div className="mt-4 text-3xl font-bold">{heading}</div>
              </>
            )
          : (
              <div className="text-3xl font-bold">{heading}</div>
            )}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

export default PageSectionHeader;
