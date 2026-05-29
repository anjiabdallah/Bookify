import { useEffect, useState } from 'react';

import ShelfFormFields from './ShelfFormFields';
import { useToast } from '../../context/useToast';
import { useAsync } from '../../hooks/useAsync';
import { requestServer } from '../../lib/requestServer';
import { stripHtml } from '../../lib/stripHtml';

import type { AddToShelfResponse, BookDetailResponse, ShelfStatus } from '../../../../server/src/api/types';

const shelfOptions: Array<[ShelfStatus, string]> = [
  ['reading', 'Currently reading'],
  ['want_to_read', 'To read'],
  ['read', 'Read'],
  ['dnf', 'DNFed'],
];

type AddToShelfFormProps = {
  book: BookDetailResponse;
  initialStatus?: ShelfStatus;
  initialRating?: number;
  initialFinishDate?: string;
  initialFavorite?: boolean;
  initialPhysicalCopy?: boolean;
  submitLabel?: string;
  onSuccess?: (response: AddToShelfResponse) => void;
};

function AddToShelfForm({
  book,
  initialStatus = 'want_to_read',
  initialRating = 0,
  initialFinishDate = '',
  initialFavorite = false,
  initialPhysicalCopy = false,
  submitLabel = 'Save to shelf',
  onSuccess,
}: AddToShelfFormProps) {
  const [selectedShelf, setSelectedShelf] = useState<ShelfStatus>(initialStatus);
  const [selectedRating, setSelectedRating] = useState<number>(initialRating);
  const [selectedFinishDate, setSelectedFinishDate] = useState<string>(initialFinishDate);
  const [selectedFavorite, setSelectedFavorite] = useState<boolean>(initialFavorite);
  const [selectedPhysicalCopy, setSelectedPhysicalCopy] = useState<boolean>(initialPhysicalCopy);
  const shelfSaver = useAsync<AddToShelfResponse>();
  const toast = useToast();

  useEffect(() => {
    if (shelfSaver.error) {
      toast.showToast(shelfSaver.error, 'error');
    }
  }, [shelfSaver.error, toast]);

  useEffect(() => {
    setSelectedShelf(initialStatus);
    setSelectedRating(initialRating);
    setSelectedFinishDate(initialFinishDate);
    setSelectedFavorite(initialFavorite);
    setSelectedPhysicalCopy(initialPhysicalCopy);
  }, [initialStatus, initialRating, initialFinishDate, initialFavorite, initialPhysicalCopy]);

  const handleAddToShelf = async () => {
    const result = await shelfSaver.execute(() =>
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

    if (result) {
      if (onSuccess) {
        await onSuccess(result);
      }
      toast.showToast('Book saved to your shelf.');
      shelfSaver.reset();
    }
  };

  return (
    <div className="mt-8 space-y-4">
      <ShelfFormFields
        book={{ title: book.title, author: book.authors[0] ?? 'Unknown' }}
        selectedShelf={selectedShelf}
        selectedRating={selectedRating}
        selectedFinishDate={selectedFinishDate}
        selectedFavorite={selectedFavorite}
        selectedPhysicalCopy={selectedPhysicalCopy}
        onShelfChange={(nextShelf) => {
          setSelectedShelf(nextShelf);
          if (nextShelf !== 'read') {
            setSelectedFinishDate('');
          }
        }}
        onRatingChange={setSelectedRating}
        onFinishDateChange={setSelectedFinishDate}
        onFavoriteChange={setSelectedFavorite}
        onPhysicalCopyChange={setSelectedPhysicalCopy}
        statusOptions={shelfOptions}
      />

      <button
        type="button"
        onClick={handleAddToShelf}
        disabled={shelfSaver.loading}
        className="btn btn-primary w-full"
      >
        {shelfSaver.loading ? 'Saving…' : submitLabel}
      </button>
    </div>
  );
}

export default AddToShelfForm;
