import DateDisplay from '../DateDisplay';
import PageCard from '../PageCard';

import type { BookDetailResponse } from '../../../../server/src/api/types';

type BookMetadataCardProps = {
  book: BookDetailResponse;
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
          <DateDisplay value={book.published_date} emptyLabel="Unknown" />
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
