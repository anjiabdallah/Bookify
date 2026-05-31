import CoverImage from './CoverImage';
import PageCard from '../ui/PageCard';

import type { BookDetailResponse } from '../../../../server/src/api/types';

type BookCoverCardProps = {
  book: BookDetailResponse;
};

function BookCoverCard({ book }: BookCoverCardProps) {
  return (
    <PageCard>
      {book.cover_url
        ? (
            <CoverImage src={book.cover_url} alt={book.title} className="w-full rounded-3xl aspect-[2/3] overflow-hidden bg-base-100" />
          )
        : (
            <div className="flex w-full aspect-[2/3] items-center justify-center overflow-hidden rounded-3xl bg-base-100 text-base-content/50">
              No cover available
            </div>
          )}
    </PageCard>
  );
}

export default BookCoverCard;
