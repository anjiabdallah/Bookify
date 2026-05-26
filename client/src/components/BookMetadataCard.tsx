import PageCard from './PageCard';

import type { BookDetailResponse } from '../../../server/src/api/types';

type BookMetadataCardProps = {
  book: BookDetailResponse;
};

function BookMetadataCard({ book }: BookMetadataCardProps) {
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

      <div className="mt-6 space-y-3 text-sm text-base-content/80">
        <div>
          <div className="font-semibold">Author</div>
          <div>{book.authors.join(', ')}</div>
        </div>

        <div>
          <div className="font-semibold">Publisher</div>
          <div>{book.publisher ?? 'Unknown'}</div>
        </div>

        <div>
          <div className="font-semibold">Published</div>
          <div>{book.published_date ?? 'Unknown'}</div>
        </div>

        <div>
          <div className="font-semibold">Pages</div>
          <div>{book.page_count ?? 'Unknown'}</div>
        </div>

        <div>
          <div className="font-semibold">Language</div>
          <div>{book.language ?? 'Unknown'}</div>
        </div>

        {book.categories.length > 0 && (
          <div>
            <div className="font-semibold">Categories</div>
            <div className="mt-2 text-sm text-base-content/80">
              {book.categories.join(', ')}
            </div>
          </div>
        )}
      </div>
    </PageCard>
  );
}

export default BookMetadataCard;
