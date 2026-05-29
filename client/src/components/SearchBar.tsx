import { Search } from 'lucide-react';

import type { FormEvent, InputHTMLAttributes } from 'react';

type SearchBarProps = {
  value?: string;
  onChange?: (value: string) => void;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  placeholder?: string;
  buttonLabel?: string;
  buttonLoading?: boolean;
  error?: string;
  className?: string;
  buttonClassName?: string;
  inputClassName?: string;
};

function SearchBar({
  value,
  onChange,
  inputProps = {},
  onSubmit,
  placeholder = 'Search for your next favorite book',
  buttonLabel = 'Search',
  buttonLoading = false,
  error,
  className = '',
  buttonClassName = '',
  inputClassName = '',
}: SearchBarProps) {
  const resolvedInputProps: InputHTMLAttributes<HTMLInputElement> = {
    ...inputProps,
  };

  if (value !== undefined && resolvedInputProps.value === undefined) {
    resolvedInputProps.value = value;
  }

  if (onChange && !resolvedInputProps.onChange) {
    resolvedInputProps.onChange = event => onChange(event.target.value);
  }

  return (
    <form onSubmit={onSubmit} className={`mt-10 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start ${className}`.trim()}>
      <div className="flex-1">
        <input
          type="text"
          placeholder={placeholder}
          className={`input input-bordered w-full bg-base-100 ${inputClassName}`.trim()}
          {...resolvedInputProps}
        />
        {error && <span className="text-sm text-error mt-1 block">{error}</span>}
      </div>
      <button type="submit" className={`btn btn-primary gap-2 ${buttonClassName}`.trim()} disabled={buttonLoading}>
        <Search size={18} />
        {buttonLoading ? 'Searching...' : buttonLabel}
      </button>
    </form>
  );
}

export default SearchBar;
