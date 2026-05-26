import { type InputHTMLAttributes } from 'react';

type FormFieldProps = {
  id: string;
  label: string;
  error?: string | null;
} & InputHTMLAttributes<HTMLInputElement>;

function FormField({ id, label, error, className = '', ...inputProps }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        className={`input input-bordered w-full ${className}`.trim()}
        {...inputProps}
      />
      {error ? <span className="text-sm text-error mt-1">{error}</span> : null}
    </div>
  );
}

export default FormField;
