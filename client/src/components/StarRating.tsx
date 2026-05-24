import { Star } from 'lucide-react';

type StarRatingProps = {
  value?: number | null;
  onChange?: (value: number) => void;
  max?: number;
  size?: number;
  className?: string;
};

function StarRating({
  value = 0,
  onChange,
  max = 5,
  size = 18,
  className = '',
}: StarRatingProps) {
  const currentRating = value ?? 0;
  const isInteractive = typeof onChange === 'function';

  return (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const isSelected = currentRating >= starValue;
        const icon = (
          <Star
            size={size}
            fill={isSelected ? 'currentColor' : 'none'}
            className={isSelected ? 'text-primary fill-current' : 'text-base-content/30'}
          />
        );

        if (isInteractive) {
          return (
            <button
              key={starValue}
              type="button"
              aria-label={`Rate ${starValue} star${starValue === 1 ? '' : 's'}`}
              onClick={() => onChange(starValue)}
              className="btn btn-ghost btn-square btn-sm p-0"
            >
              {icon}
            </button>
          );
        }

        return (
          <span key={starValue} className="inline-flex">
            {icon}
          </span>
        );
      })}
    </div>
  );
}

export default StarRating;
