import PageCard from './PageCard';

import type { BookDetailResponse } from '../../../server/src/api/types';

type BookMetadataCardProps = {
  book: BookDetailResponse;
};

const formatPublishedDate = (dateString: string | null | undefined) => {
  if (!dateString) {
    return 'Unknown';
  }

  const isoDateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateMatch) {
    return `${isoDateMatch[3]}/${isoDateMatch[2]}/${isoDateMatch[1]}`;
  }

  return dateString;
};

function BookMetadataCard({ book }: BookMetadataCardProps) {
  return (
    <PageCard>
      <div className="space-y-3 text-sm text-base-content/80">
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
          <div>{formatPublishedDate(book.published_date)}</div>
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
