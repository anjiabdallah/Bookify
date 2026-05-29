import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

type ShelfStatCardProps = {
  icon: ReactNode;
  count: number;
  label: string;
  to: string;
  loading?: boolean;
};

function ShelfStatCard({ icon, count, label, to, loading = false }: ShelfStatCardProps) {
  return (
    <div className="flex flex-col items-center gap-3 p-4">
      {icon}
      <div className="text-3xl font-bold">
        {loading ? <span className="loading loading-spinner loading-md" /> : count}
      </div>
      <Link to={to} className="text-sm font-semibold text-primary hover:underline">
        {label}
      </Link>
    </div>
  );
}

export default ShelfStatCard;
