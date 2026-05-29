import { useCallback } from 'react';

import StarRating from './StarRating';

import type { ShelfModalBook } from '../types/shelfModal.ts';
import type { ReactNode } from 'react';

type ShelfActionModalProps = {
  show: boolean;
  book: ShelfModalBook | null;
  selectedShelf: 'reading' | 'want_to_read' | 'read';
  selectedRating: number;
  selectedFinishDate: string;
  selectedFavorite: boolean;
  selectedPhysicalCopy: boolean;
  onShelfChange: (value: 'reading' | 'want_to_read' | 'read') => void;
  onRatingChange: (value: number) => void;
  onFinishDateChange: (value: string) => void;
  onFavoriteChange: (value: boolean) => void;
  onPhysicalCopyChange: (value: boolean) => void;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
  className?: string;
  children?: ReactNode;
};

function ShelfActionModal({
  show,
  book,
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
  onConfirm,
  onClose,
  loading,
  className = '',
}: ShelfActionModalProps) {
  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <div className={`modal ${show ? 'modal-open' : ''} ${className}`.trim()}>
      <div className="modal-box max-w-lg relative">
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-circle absolute right-4 top-4"
          onClick={handleCancel}
        >
          ✕
        </button>

        <h3 className="text-xl font-bold">Add to your shelf</h3>

        {book
          ? (
              <>
                <p className="mt-3 text-base-content/70">{book.title}</p>
                <p className="text-sm text-base-content/50">{book.author}</p>

                <div className="mt-5">
                  <label className="label">
                    <span className="label-text">Shelf status</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={selectedShelf}
                    onChange={event => onShelfChange(event.target.value as 'reading' | 'want_to_read' | 'read')}
                  >
                    <option value="reading">Currently Reading</option>
                    <option value="want_to_read">Want to Read</option>
                    <option value="read">Read</option>
                  </select>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
                    <div className="mt-5">
                      <label className="label">
                        <span className="label-text">Rate it now</span>
                      </label>
                      <StarRating value={selectedRating} onChange={onRatingChange} />
                      <p className="text-sm text-base-content/60 mt-2">Choose a star rating before you save this book as Read.</p>
                    </div>

                    <div className="mt-5">
                      <label className="label">
                        <span className="label-text">Finish date</span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered w-full"
                        value={selectedFinishDate}
                        onChange={event => onFinishDateChange(event.target.value)}
                      />
                      <p className="text-sm text-base-content/60 mt-2">Optionally set when you finished this book.</p>
                    </div>
                  </>
                )}

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    type="button"
                    className="btn btn-primary w-full"
                    onClick={onConfirm}
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add to Shelf'}
                  </button>
                  <button type="button" className="btn btn-ghost w-full" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              </>
            )
          : (
              <div className="mt-6 text-base-content/70">No book selected to add.</div>
            )}
      </div>
    </div>
  );
}

export default ShelfActionModal;
