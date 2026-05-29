import type { ReactNode } from 'react';

type FieldGroupProps = {
  label: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
  className?: string;
};

function FieldGroup({ label, hint, error, children, className = '' }: FieldGroupProps) {
  return (
    <div className={`space-y-2 ${className}`.trim()}>
      <label className="label">
        <span className="label-text font-medium">{label}</span>
      </label>
      <div>{children}</div>
      {hint ? <p className="text-sm text-base-content/70">{hint}</p> : null}
      {error ? <p className="text-sm text-error">{error}</p> : null}
    </div>
  );
}

export default FieldGroup;
