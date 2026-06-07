import { Eye, EyeOff } from 'lucide-react';
import { useState, type InputHTMLAttributes } from 'react';

type FormFieldProps = {
  id: string;
  label: string;
  error?: string | null;
} & InputHTMLAttributes<HTMLInputElement>;

function FormField({ id, label, error, className = '', type, ...inputProps }: FormFieldProps) {
  const isPasswordField = type === 'password';
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const inputType = isPasswordField ? (isPasswordVisible ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-2 w-full">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative w-full">
        <input
          id={id}
          type={inputType}
          className={`input input-bordered w-full ${isPasswordField ? 'pr-10' : ''} ${className}`.trim()}
          {...inputProps}
        />
        {isPasswordField
          ? (
              <button
                type="button"
                onClick={() => setIsPasswordVisible(prev => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-base-content/70 hover:text-base-content hover:cursor-pointer"
                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
              >
                {isPasswordVisible ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            )
          : null}
      </div>
      <div className="min-h-1">
        {error ? <span className="text-sm text-error block">{error}</span> : null}
      </div>
    </div>
  );
}

export default FormField;
