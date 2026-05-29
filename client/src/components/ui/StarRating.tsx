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
        const fillPercent = Math.min(Math.max(currentRating - index, 0), 1) * 100;

        return (
          <div key={starValue} className="relative inline-flex">
            <Star
              size={size}
              fill="none"
              className="text-base-content/30"
            />
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
              <Star
                size={size}
                fill="currentColor"
                className="text-primary"
              />
            </div>

            {isInteractive && Array.from({ length: 4 }, (_, segmentIndex) => {
              const segmentValue = index + (segmentIndex + 1) * 0.25;
              const labelValue = Number.isInteger(segmentValue) ? `${segmentValue}` : segmentValue.toFixed(2);

              return (
                <button
                  key={`${starValue}-${segmentIndex}`}
                  type="button"
                  aria-label={`Rate ${labelValue} star${segmentValue === 1 ? '' : 's'}`}
                  onClick={() => onChange(segmentValue)}
                  className="absolute inset-y-0 bg-transparent p-0"
                  style={{ left: `${segmentIndex * 25}%`, width: '25%' }}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default StarRating;
