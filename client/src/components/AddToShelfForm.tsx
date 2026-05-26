import { useState } from 'react';

import StarRating from './StarRating';
import { useAsync } from '../hooks/useAsync';
import { requestServer } from '../lib/requestServer';
import { stripHtml } from '../lib/stripHtml';

import type { AddToShelfResponse, BookDetailResponse, ShelfStatus } from '../../../server/src/api/types';

const shelfOptions: Array<[ShelfStatus, string]> = [
  ['reading', 'Currently reading'],
  ['want_to_read', 'To read'],
  ['read', 'Read'],
  ['dnf', 'DNFed'],
];

type AddToShelfFormProps = {
  book: BookDetailResponse;
};

function AddToShelfForm({ book }: AddToShelfFormProps) {
  const [selectedShelf, setSelectedShelf] = useState<ShelfStatus>('want_to_read');
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [selectedFinishDate, setSelectedFinishDate] = useState<string>('');
  const [selectedFavorite, setSelectedFavorite] = useState<boolean>(false);
  const [selectedPhysicalCopy, setSelectedPhysicalCopy] = useState<boolean>(false);
  const shelfSaver = useAsync<AddToShelfResponse>();

  const handleAddToShelf = async () => {
    await shelfSaver.execute(() =>
      requestServer<AddToShelfResponse>('/api/books/shelf', {
        method: 'POST',
        body: JSON.stringify({
          google_books_id: book.google_books_id,
          title: book.title,
          author: book.authors[0] ?? 'Unknown',
          ...(book.cover_url ? { cover_url: book.cover_url } : {}),
          ...(stripHtml(book.description) ? { description: stripHtml(book.description) } : {}),
          ...(book.published_date ? { published_date: book.published_date } : {}),
          status: selectedShelf,
          ...(selectedShelf === 'read' && selectedRating > 0 ? { rating: selectedRating } : {}),
          ...(selectedShelf === 'read' && selectedFinishDate ? { finish_date: selectedFinishDate } : {}),
          favorite: selectedFavorite,
          physical_copy: selectedPhysicalCopy,
        }),
      }),
    );
  };

  return (
    <div className="mt-8 space-y-4">
      <div>
        <label className="label">
          <span className="label-text">Add to shelf</span>
        </label>
        <select
          value={selectedShelf}
          onChange={(event) => {
            const nextShelf = event.target.value as ShelfStatus;
            setSelectedShelf(nextShelf);
            if (nextShelf !== 'read') {
              setSelectedFinishDate('');
            }
          }}
          className="select select-bordered w-full"
        >
          {shelfOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="cursor-pointer rounded-2xl border border-base-200 p-4 flex items-center justify-start gap-3">
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={selectedFavorite}
            onChange={event => setSelectedFavorite(event.target.checked)}
          />
          <span className="text-base font-medium">Favorites</span>
        </label>

        <label className="cursor-pointer rounded-2xl border border-base-200 p-4 flex items-center justify-start gap-3">
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={selectedPhysicalCopy}
            onChange={event => setSelectedPhysicalCopy(event.target.checked)}
          />
          <span className="text-base font-medium">Physical copy</span>
        </label>
      </div>

      {selectedShelf === 'read' && (
        <>
          <div>
            <label className="label">
              <span className="label-text">Rate it now</span>
            </label>
            <StarRating value={selectedRating} onChange={setSelectedRating} />
            <p className="text-sm text-base-content/60 mt-2">
              Optional: choose a star rating when you save this book as Read.
            </p>
          </div>

          <div className="mt-5">
            <label className="label">
              <span className="label-text">Finish date</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={selectedFinishDate}
              onChange={event => setSelectedFinishDate(event.target.value)}
            />
            <p className="text-sm text-base-content/60 mt-2">
              Optionally set when you finished this book.
            </p>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={handleAddToShelf}
        disabled={shelfSaver.loading}
        className="btn btn-primary w-full"
      >
        {shelfSaver.loading ? 'Saving…' : 'Save to shelf'}
      </button>

      {shelfSaver.error && (
        <div className="alert alert-error">
          <span>{shelfSaver.error}</span>
        </div>
      )}

      {shelfSaver.data && (
        <div className="alert alert-success">
          <span>Book saved to your shelf.</span>
        </div>
      )}
    </div>
  );
}

export default AddToShelfForm;
