type DateDisplayProps = {
  value?: string | null;
  emptyLabel?: string;
  fallback?: string;
  yearOnly?: boolean;
  className?: string;
};

function DateDisplay({
  value,
  emptyLabel = 'Unknown',
  fallback,
  yearOnly = false,
  className = '',
}: DateDisplayProps) {
  if (!value) {
    return <span className={className}>{emptyLabel}</span>;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return <span className={className}>{fallback ?? value}</span>;
  }

  const formatted = yearOnly
    ? String(date.getFullYear())
    : date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

  return <span className={className}>{formatted}</span>;
}

export default DateDisplay;
