import type { ReactNode } from 'react';
import { useCallback } from 'react';

import StarRating from './StarRating';

export type ShelfModalBook = {
  google_books_id: string;
  title: string;
  author: string;
  cover_url?: string | null;
  description?: string | null;
  published_date?: string | null;
};

type ShelfActionModalProps = {
  show: boolean;
  book: ShelfModalBook | null;
  selectedShelf: 'reading' | 'want_to_read' | 'read';
  selectedRating: number;
  onShelfChange: (value: 'reading' | 'want_to_read' | 'read') => void;
  onRatingChange: (value: number) => void;
  onConfirm: () => void;
  onClose: () => void;
  error?: string;
  success?: string;
  loading?: boolean;
  className?: string;
  children?: ReactNode;
};

function ShelfActionModal({
  show,
  book,
  selectedShelf,
  selectedRating,
  onShelfChange,
  onRatingChange,
  onConfirm,
  onClose,
  error,
  success,
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

        {book ? (
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

            {selectedShelf === 'read' && (
              <div className="mt-5">
                <label className="label">
                  <span className="label-text">Rate it now</span>
                </label>
                <StarRating value={selectedRating} onChange={onRatingChange} />
                <p className="text-sm text-base-content/60 mt-2">Choose a star rating before you save this book as Read.</p>
              </div>
            )}

            {error && (
              <div className="alert alert-error mt-4">
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="alert alert-success mt-4">
                <span>{success}</span>
              </div>
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
        ) : (
          <div className="mt-6 text-base-content/70">No book selected to add.</div>
        )}
      </div>
    </div>
  );
}

export default ShelfActionModal;
