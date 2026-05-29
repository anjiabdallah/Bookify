import { Link } from 'react-router-dom';

import DateDisplay from '../ui/DateDisplay';
import StarRating from '../ui/StarRating';

import type { GetShelfResponse } from '../../../../server/src/api/types';

type BookShelfInfoDisplayProps = {
  entry: GetShelfResponse[number];
};

const statusLabel: Record<NonNullable<GetShelfResponse[number]['status']>, string> = {
  reading: 'Currently reading',
  want_to_read: 'To read',
  read: 'Finished',
  dnf: 'DNFed',
};

function BookShelfInfoDisplay({ entry }: BookShelfInfoDisplayProps) {
  const ratingValue = typeof entry.rating === 'number'
    ? entry.rating
    : Number(entry.rating);

  return (
    <section className="border-t border-base-200 pt-4">
      <div className="flex flex-col gap-6">

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="font-semibold">Shelf</div>
            <Link
              to={`/my-books/${entry.status}`}
              className="text-base-content hover:underline"
            >
              {statusLabel[entry.status]}
            </Link>
            {entry.status === 'read' && (
              <div className="mt-3 space-y-2">
                <div className="font-semibold">Rating</div>
                <div className="flex items-center gap-3">
                  <StarRating value={Number.isFinite(ratingValue) ? ratingValue : 0} />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="font-semibold">Added On</div>
            <DateDisplay value={entry.added_at} />
            {entry.status === 'read' && (
              <div className="mt-3 space-y-1">
                <div className="font-semibold">Finished On</div>
                <div>{entry.finish_date ? <DateDisplay value={entry.finish_date} /> : 'Not set'}</div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-base-content/70">
          {entry.favorite && <span className="badge badge-primary badge-sm">Favorite</span>}
          {entry.physical_copy && <span className="badge badge-accent badge-sm">Physical copy</span>}
        </div>
      </div>
    </section>
  );
}

export default BookShelfInfoDisplay;
