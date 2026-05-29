import BookCard from './BookCard';
import DateDisplay from '../ui/DateDisplay';
import StarRating from '../ui/StarRating';

import type { GetShelfResponse, ShelfStatus } from '../../../../server/src/api/types';

type ShelfBookCardProps = {
  book: GetShelfResponse[number];
  status: ShelfStatus;
  onRate?: (value: number) => void;
};

function ShelfBookCard({ book, status, onRate }: ShelfBookCardProps) {
  const hasRating = book.rating !== null && book.rating !== undefined && book.rating > 0;
  const tagBadges = [
    book.favorite ? <span key="favorite" className="badge badge-primary badge-sm">Favorite</span> : null,
    book.physical_copy ? <span key="physical" className="badge badge-accent badge-sm">Physical copy</span> : null,
  ].filter(Boolean);

  return (
    <BookCard
      coverUrl={book.cover_url}
      title={book.title}
      titleLink={`/book/${book.google_books_id}`}
      author={book.author}
      className="p-4 shadow-sm"
    >
      <div className="space-y-3">
        {status === 'read'
          ? (
              <div className="space-y-3">
                {hasRating && (
                  <StarRating
                    value={book.rating ?? 0}
                    onChange={value => onRate?.(value)}
                  />
                )}
                {book.finish_date && (
                  <div className="text-sm text-base-content/70">
                    Finished on
                    {' '}
                    <DateDisplay value={book.finish_date} />
                  </div>
                )}
                <div className="flex flex-wrap gap-2 text-sm text-base-content/70">
                  {tagBadges}
                </div>
              </div>
            )
          : (
              <div className="flex flex-wrap gap-2 text-sm text-base-content/70">
                {tagBadges}
              </div>
            )}
      </div>
    </BookCard>
  );
}

export default ShelfBookCard;
