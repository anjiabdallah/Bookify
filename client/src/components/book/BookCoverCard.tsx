import PageCard from '../ui/PageCard';

import type { BookDetailResponse } from '../../../../server/src/api/types';

type BookCoverCardProps = {
  book: BookDetailResponse;
};

function BookCoverCard({ book }: BookCoverCardProps) {
  return (
    <PageCard>
      <div className="h-96 overflow-hidden rounded-3xl bg-base-100">
        {book.cover_url
          ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="h-full w-full object-cover"
              />
            )
          : (
              <div className="flex h-full items-center justify-center text-base-content/50">
                No cover available
              </div>
            )}
      </div>
    </PageCard>
  );
}

export default BookCoverCard;
