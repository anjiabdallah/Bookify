import FieldGroup from '../ui/FieldGroup';
import StarRating from '../ui/StarRating';

import type { ShelfStatus } from '../../../../server/src/api/types';

type ShelfFormFieldsBook = {
  title: string;
  author: string;
};

type ShelfFormFieldsProps = {
  book?: ShelfFormFieldsBook;
  showBookHeading?: boolean;
  selectedShelf: ShelfStatus;
  selectedRating: number;
  selectedFinishDate: string;
  selectedFavorite: boolean;
  selectedPhysicalCopy: boolean;
  onShelfChange: (value: ShelfStatus) => void;
  onRatingChange: (value: number) => void;
  onFinishDateChange: (value: string) => void;
  onFavoriteChange: (value: boolean) => void;
  onPhysicalCopyChange: (value: boolean) => void;
  statusOptions?: Array<[ShelfStatus, string]>;
};

const defaultStatusOptions: Array<[ShelfStatus, string]> = [
  ['reading', 'Currently Reading'],
  ['want_to_read', 'Want to Read'],
  ['read', 'Read'],
];

function ShelfFormFields({
  book,
  showBookHeading = true,
  selectedShelf,
  selectedRating,
  selectedFinishDate,
  selectedFavorite,
  selectedPhysicalCopy,
  onShelfChange,
  onRatingChange,
  onFinishDateChange,
  onFavoriteChange,
  onPhysicalCopyChange,
  statusOptions = defaultStatusOptions,
}: ShelfFormFieldsProps) {
  return (
    <div className="space-y-4">
      {showBookHeading && book && (
        <>
          <p className="mt-3 text-base-content/70">{book.title}</p>
          <p className="text-sm text-base-content/50">{book.author}</p>
        </>
      )}

      <FieldGroup label="Shelf">
        <select
          className="select select-bordered w-full"
          value={selectedShelf}
          onChange={event => onShelfChange(event.target.value as ShelfStatus)}
        >
          {statusOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </FieldGroup>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="cursor-pointer rounded-2xl border border-base-200 p-4 flex items-center justify-start gap-3">
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={selectedFavorite}
            onChange={event => onFavoriteChange(event.target.checked)}
          />
          <span className="text-base font-medium">Favorites</span>
        </label>

        <label className="cursor-pointer rounded-2xl border border-base-200 p-4 flex items-center justify-start gap-3">
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={selectedPhysicalCopy}
            onChange={event => onPhysicalCopyChange(event.target.checked)}
          />
          <span className="text-base font-medium">Physical copy</span>
        </label>
      </div>

      {selectedShelf === 'read' && (
        <>
          <FieldGroup label="Rating (optional)">
            <StarRating value={selectedRating} onChange={onRatingChange} />
          </FieldGroup>

          <FieldGroup label="Finish date (optional)">
            <input
              type="date"
              className="input input-bordered w-full"
              value={selectedFinishDate}
              onChange={event => onFinishDateChange(event.target.value)}
            />
          </FieldGroup>
        </>
      )}
    </div>
  );
}

export default ShelfFormFields;
