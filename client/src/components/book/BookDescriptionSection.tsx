import { stripHtml } from '../../lib/stripHtml';

import type { BookDetailResponse } from '../../../../server/src/api/types';

type BookDescriptionSectionProps = {
  description: BookDetailResponse['description'];
};

function BookDescriptionSection({ description }: BookDescriptionSectionProps) {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">About this book</h2>
      <p className="text-base-content/80 whitespace-pre-line">
        {stripHtml(description) ?? 'No description available for this title.'}
      </p>
    </>
  );
}

export default BookDescriptionSection;
