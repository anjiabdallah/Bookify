import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import BackButton from '../components/BackButton';
import AddToShelfForm from '../components/book/AddToShelfForm';
import BookCoverCard from '../components/book/BookCoverCard';
import BookDescriptionSection from '../components/book/BookDescriptionSection';
import BookMetadataCard from '../components/book/BookMetadataCard';
import BookShelfInfoDisplay from '../components/book/BookShelfInfoDisplay';
import PageCard from '../components/PageCard';
import PageSectionHeader from '../components/PageSectionHeader';
import { useAuth } from '../context/useAuth';
import { useAsync } from '../hooks/useAsync';
import { requestServer } from '../lib/requestServer';

import type { BookDetailResponse, GetShelfResponse } from '../../../server/src/api/types';

function BookDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const bookQuery = useAsync<BookDetailResponse>();
  const shelfQuery = useAsync<GetShelfResponse>();
  const [isShelfEditing, setIsShelfEditing] = useState(false);
  const book = bookQuery.data;

  useEffect(() => {
    if (!id) return;

    bookQuery.execute(() => requestServer<BookDetailResponse>(`/api/books/details/${encodeURIComponent(id)}`));
  }, [id]);

  useEffect(() => {
    if (!user) return;

    shelfQuery.execute(() => requestServer<GetShelfResponse>('/api/books/shelf'));
  }, [user]);

  const shelfEntry = useMemo(() => {
    if (!book || !shelfQuery.data) return null;

    return shelfQuery.data.find(entry => entry.google_books_id === book.google_books_id) ?? null;
  }, [book, shelfQuery.data]);

  const handleShelfSaved = async () => {
    setIsShelfEditing(false);
    shelfQuery.execute(() => requestServer<GetShelfResponse>('/api/books/shelf'));
  };

  let shelfSection = null;

  if (user && book) {
    if (shelfEntry && !isShelfEditing) {
      shelfSection = (
        <BookShelfInfoDisplay
          entry={shelfEntry}
          onEdit={() => setIsShelfEditing(true)}
        />
      );
    } else {
      shelfSection = (
        <AddToShelfForm
          book={book}
          initialStatus={shelfEntry?.status}
          initialRating={shelfEntry?.rating ?? 0}
          initialFinishDate={shelfEntry?.finish_date ?? ''}
          initialFavorite={shelfEntry?.favorite ?? false}
          initialPhysicalCopy={shelfEntry?.physical_copy ?? false}
          submitLabel={shelfEntry ? 'Update shelf info' : 'Save to shelf'}
          onSuccess={handleShelfSaved}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <main className="container mx-auto px-6 py-10">
        <div className="mb-6">
          <BackButton className="btn-ghost mb-4" />
          <PageSectionHeader
            label="Book Details"
            heading={book?.title ?? 'Loading...'}
          />
        </div>

        {bookQuery.loading && (
          <PageCard className="text-center">Loading book details…</PageCard>
        )}

        {bookQuery.error && (
          <div className="alert alert-error">
            <span>{bookQuery.error}</span>
          </div>
        )}

        {book && !bookQuery.loading && !bookQuery.error && (
          <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
            <div className="flex flex-col gap-8">
              <BookCoverCard book={book} />
              <BookMetadataCard book={book} />
            </div>

            <div className="flex flex-col gap-6 lg:self-start">
              <PageCard>
                <BookDescriptionSection description={book.description} />
              </PageCard>

              {shelfSection && (
                <PageCard>
                  {shelfSection}
                </PageCard>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default BookDetailPage;
