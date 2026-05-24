import { Link } from 'react-router-dom';

import BookCard from './BookCard';
import StarRating from './StarRating';

import type { GetShelfResponse, ShelfStatus } from '../../../server/src/api/types';

type ShelfBookCardProps = {
  book: GetShelfResponse[number];
  status: ShelfStatus;
  onRate?: (value: number) => void;
};

const statusLabel: Record<ShelfStatus, string> = {
  reading: 'Reading',
  want_to_read: 'To read',
  read: 'Finished',
  dnf: 'DNFed',
};

const statusClass: Record<ShelfStatus, string> = {
  reading: 'badge badge-primary gap-2',
  want_to_read: 'badge badge-ghost gap-2',
  read: 'badge badge-success gap-2',
  dnf: 'badge badge-error gap-2',
};

const formatFinishDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());

  return `${day}/${month}/${year}`;
};

function ShelfBookCard({ book, status, onRate }: ShelfBookCardProps) {
  const showDetailsLink = status === 'read' || status === 'want_to_read';

  const topRight = showDetailsLink
    ? (
        <Link to={`/book/${book.google_books_id}`} className="badge badge-outline badge-sm">
          View details
        </Link>
      )
    : (
        <span className={statusClass[status]}>{statusLabel[status]}</span>
      );

  return (
    <BookCard
      coverUrl={book.cover_url}
      title={book.title}
      author={book.author}
      topRight={topRight}
      className="p-4 shadow-sm"
    >
      <div className="space-y-3">
        {status === 'read'
          ? (
              <div className="space-y-3">
                <StarRating
                  value={book.rating ?? 0}
                  onChange={value => onRate?.(value)}
                />
                {book.finish_date && (
                  <div className="text-sm text-base-content/70">
                    Finished on
                    {formatFinishDate(book.finish_date)}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 text-sm text-base-content/70">
                  {book.favorite && <span className="badge badge-primary badge-sm">Favorite</span>}
                  {book.physical_copy && <span className="badge badge-accent badge-sm">Physical copy</span>}
                </div>
              </div>
            )
          : (
              <div className="flex flex-wrap gap-2 text-sm text-base-content/70">
                {book.favorite && <span className="badge badge-primary badge-sm">Favorite</span>}
                {book.physical_copy && <span className="badge badge-accent badge-sm">Physical copy</span>}
                {status !== 'want_to_read' && (
                  <span className={statusClass[status]}>{statusLabel[status]}</span>
                )}
              </div>
            )}
      </div>
    </BookCard>
  );
}

export default ShelfBookCard;
