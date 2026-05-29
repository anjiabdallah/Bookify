import { useCallback } from 'react';

import ShelfFormFields from './ShelfFormFields';

import type { ShelfStatus } from '../../../../server/src/api/types';
import type { ShelfModalBook } from '../../types/shelfModal.ts';
import type { ReactNode } from 'react';

type ShelfActionModalProps = {
  show: boolean;
  book: ShelfModalBook | null;
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
                <ShelfFormFields
                  book={{ title: book.title, author: book.author }}
                  selectedShelf={selectedShelf}
                  selectedRating={selectedRating}
                  selectedFinishDate={selectedFinishDate}
                  selectedFavorite={selectedFavorite}
                  selectedPhysicalCopy={selectedPhysicalCopy}
                  onShelfChange={onShelfChange}
                  onRatingChange={onRatingChange}
                  onFinishDateChange={onFinishDateChange}
                  onFavoriteChange={onFavoriteChange}
                  onPhysicalCopyChange={onPhysicalCopyChange}
                />

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
