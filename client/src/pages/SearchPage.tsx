import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import BookCard from '../components/book/BookCard';
import ShelfActionModal from '../components/book/ShelfActionModal';
import PageCard from '../components/ui/PageCard';
import PageSectionHeader from '../components/ui/PageSectionHeader';
import SearchBar from '../components/ui/SearchBar';
import { useAuth } from '../context/useAuth';
import { useToast } from '../context/useToast';
import { useAsync } from '../hooks/useAsync';
import { requestServer } from '../lib/requestServer';

import type { AddToShelfResponse, SearchBooksResponse, ShelfStatus } from '../../../server/src/api/types';

const searchSchema = z.object({
  query: z.string().trim().min(1, { message: 'Please enter a search term.' }),
});

type SearchFormData = z.infer<typeof searchSchema>;

function SearchPage() {
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialQuery = params.get('q') ?? '';

  const [results, setResults] = useState<SearchBooksResponse>([]);
  const [selectedBook, setSelectedBook] = useState<SearchBooksResponse[number] | null>(null);
  const [selectedShelf, setSelectedShelf] = useState<ShelfStatus>('reading');
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [selectedFinishDate, setSelectedFinishDate] = useState<string>('');
  const [selectedFavorite, setSelectedFavorite] = useState<boolean>(false);
  const [selectedPhysicalCopy, setSelectedPhysicalCopy] = useState<boolean>(false);
  const searchRunner = useAsync<SearchBooksResponse>();
  const addShelfRunner = useAsync<AddToShelfResponse>();

  useEffect(() => {
    if (searchRunner.error) {
      toast.showToast(searchRunner.error, 'error');
    }
  }, [searchRunner.error, toast]);

  useEffect(() => {
    if (addShelfRunner.error) {
      toast.showToast(addShelfRunner.error, 'error');
    }
  }, [addShelfRunner.error, toast]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: initialQuery },
  });

  const performSearch = useCallback(async (searchTerm: string) => {
    const data = await searchRunner.execute(() =>
      requestServer<SearchBooksResponse>(`/api/books/search?q=${encodeURIComponent(searchTerm)}`),
    );

    setResults(data ?? []);
  }, []);

  useEffect(() => {
    if (initialQuery.trim()) {
      reset({ query: initialQuery });
      performSearch(initialQuery);
    }
  }, [initialQuery, reset, performSearch]);

  const onSubmit = async (values: SearchFormData) => {
    navigate(`/search?q=${encodeURIComponent(values.query)}`);
    await performSearch(values.query);
  };

  const closeAddShelfModal = () => {
    setSelectedBook(null);
    setSelectedRating(0);
    setSelectedFinishDate('');
    setSelectedFavorite(false);
    setSelectedPhysicalCopy(false);
    const checkbox = document.getElementById('add-shelf-modal') as HTMLInputElement | null;
    if (checkbox) checkbox.checked = false;
  };

  const handleAddToShelf = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedBook) return;

    const body = JSON.stringify({
      google_books_id: selectedBook.google_books_id,
      title: selectedBook.title,
      author: selectedBook.author,
      ...(selectedBook.cover_url ? { cover_url: selectedBook.cover_url } : {}),
      ...(selectedBook.description ? { description: selectedBook.description } : {}),
      ...(selectedBook.published_date ? { published_date: selectedBook.published_date } : {}),
      status: selectedShelf,
      ...(selectedShelf === 'read' && selectedRating > 0 ? { rating: selectedRating } : {}),
      ...(selectedShelf === 'read' && selectedFinishDate ? { finish_date: selectedFinishDate } : {}),
      favorite: selectedFavorite,
      physical_copy: selectedPhysicalCopy,
    });

    await addShelfRunner.execute(() =>
      requestServer<AddToShelfResponse>('/api/books/shelf', {
        method: 'POST',
        body,
      }),
    );

    if (!addShelfRunner.error) {
      closeAddShelfModal();
      toast.showToast('Book added to your shelf!');
      addShelfRunner.reset();
    }
  };

  const queryError = useMemo(() => errors.query?.message, [errors.query]);

  let resultsContent = (
    <div className="mt-6 rounded-2xl border border-base-200 bg-base-100 p-12 text-center text-base-content/70">
      <div className="text-5xl text-primary/30">📖</div>
      <p className="mt-4">Enter a book title, author, or keyword to begin searching.</p>
    </div>
  );

  if (searchRunner.loading) {
    resultsContent = (
      <div className="mt-6 flex items-center justify-center rounded-2xl border border-base-200 bg-base-100 p-12 text-primary">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  } else if (results.length > 0) {
    resultsContent = (
      <div className="mt-6 flex flex-col gap-4">
        {results.map((result) => {
          return (
            <BookCard
              key={result.google_books_id}
              coverUrl={result.cover_url}
              title={result.title}
              titleLink={`/book/${result.google_books_id}`}
              author={result.author}
            >
              <p className="text-sm text-base-content/70 line-clamp-3">{result.description ?? 'No description available.'}</p>
            </BookCard>
          );
        })}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <main className="container mx-auto px-6 py-10">
        <PageCard>
          <PageCard className="relative overflow-hidden">
            <div className="absolute right-6 top-6 text-primary/20 text-3xl">✦ ✦</div>
            <PageSectionHeader
              label="Book Search"
              heading="Find your next favorite read."
            />

            <SearchBar
              inputProps={register('query')}
              onSubmit={handleSubmit(onSubmit)}
              placeholder="Search books by title, author, or keyword"
              buttonLoading={isSubmitting}
              error={queryError}
              className="flex flex-col gap-3"
              buttonClassName="rounded-2xl px-8"
              inputClassName="rounded-2xl pl-6"
            />
          </PageCard>

          {resultsContent}

        </PageCard>

        <ShelfActionModal
          show={Boolean(selectedBook)}
          book={selectedBook}
          selectedShelf={selectedShelf}
          selectedRating={selectedRating}
          selectedFinishDate={selectedFinishDate}
          selectedFavorite={selectedFavorite}
          selectedPhysicalCopy={selectedPhysicalCopy}
          onShelfChange={(value) => {
            setSelectedShelf(value);
            if (value !== 'read') {
              setSelectedFinishDate('');
            }
          }}
          onRatingChange={setSelectedRating}
          onFinishDateChange={setSelectedFinishDate}
          onFavoriteChange={setSelectedFavorite}
          onPhysicalCopyChange={setSelectedPhysicalCopy}
          onConfirm={handleAddToShelf}
          onClose={closeAddShelfModal}
          loading={addShelfRunner.loading}
        />
      </main>
    </div>
  );
}

export default SearchPage;
