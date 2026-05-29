import DateDisplay from '../DateDisplay';
import StarRating from '../StarRating';

import type { GetShelfResponse } from '../../../../server/src/api/types';

type BookShelfInfoDisplayProps = {
  entry: GetShelfResponse[number];
  onEdit: () => void;
};

const statusLabel: Record<NonNullable<GetShelfResponse[number]['status']>, string> = {
  reading: 'Currently reading',
  want_to_read: 'To read',
  read: 'Finished',
  dnf: 'DNFed',
};

const statusClass: Record<NonNullable<GetShelfResponse[number]['status']>, string> = {
  reading: 'badge badge-primary gap-2',
  want_to_read: 'badge badge-ghost gap-2',
  read: 'badge badge-success gap-2',
  dnf: 'badge badge-error gap-2',
};

function BookShelfInfoDisplay({ entry, onEdit }: BookShelfInfoDisplayProps) {
  const ratingValue = typeof entry.rating === 'number'
    ? entry.rating
    : Number(entry.rating);
  const hasRating = Number.isFinite(ratingValue) && ratingValue > 0;

  return (
    <section className="mt-8 border-t border-base-200 pt-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Your shelf info</h2>
            <p className="text-sm text-base-content/70 mt-1">
              Edit the status of the book
            </p>
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={onEdit}>
            Edit
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="font-semibold">Shelf status</div>
            <span className={statusClass[entry.status]}>{statusLabel[entry.status]}</span>
          </div>

          <div className="space-y-2">
            <div className="font-semibold">Added</div>
            <DateDisplay value={entry.added_at} />
          </div>
        </div>

        {entry.status === 'read'
          ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="font-semibold">Rating</div>
                  <div className="flex items-center gap-3">
                    <StarRating value={Number.isFinite(ratingValue) ? ratingValue : 0} />
                    <span className="text-sm text-base-content/70">
                      {hasRating ? `${ratingValue.toFixed(2)} / 5` : 'Not rated yet'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-semibold">Finished</div>
                  <div>{entry.finish_date ? <DateDisplay value={entry.finish_date} /> : 'Not set'}</div>
                </div>
              </div>
            )
          : null}

        <div className="flex flex-wrap gap-2 text-sm text-base-content/70">
          {entry.favorite && <span className="badge badge-primary badge-sm">Favorite</span>}
          {entry.physical_copy && <span className="badge badge-accent badge-sm">Physical copy</span>}
          {entry.status !== 'read' && <span className={statusClass[entry.status]}>{statusLabel[entry.status]}</span>}
        </div>
      </div>
    </section>
  );
}

export default BookShelfInfoDisplay;
