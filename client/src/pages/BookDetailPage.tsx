import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import AddToShelfForm from '../components/AddToShelfForm';
import BackButton from '../components/BackButton';
import BookCoverCard from '../components/BookCoverCard';
import BookDescriptionSection from '../components/BookDescriptionSection';
import BookMetadataCard from '../components/BookMetadataCard';
import PageCard from '../components/PageCard';
import PageSectionHeader from '../components/PageSectionHeader';
import { useAuth } from '../context/useAuth';
import { useAsync } from '../hooks/useAsync';
import { requestServer } from '../lib/requestServer';

import type { BookDetailResponse } from '../../../server/src/api/types';

function BookDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const bookQuery = useAsync<BookDetailResponse>();
  const book = bookQuery.data;

  useEffect(() => {
    if (!id) return;

    bookQuery.execute(() => requestServer<BookDetailResponse>(`/api/books/details/${encodeURIComponent(id)}`));
  }, [id]);

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <main className="container mx-auto px-6 py-10">
        <div className="mb-6">
          <BackButton className="btn-ghost mb-4" />
          <PageSectionHeader
            label="Book Details"
            heading={book?.title ?? 'Loading...'}
            right={user && (
              <div className="text-sm text-base-content/50">
                Logged in as
                <br />
                {user.username}
              </div>
            )}
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

            <PageCard className="lg:self-start">
              <BookDescriptionSection description={book.description} />

              {user && <AddToShelfForm book={book} />}
            </PageCard>
          </div>
        )}
      </main>
    </div>
  );
}

export default BookDetailPage;
