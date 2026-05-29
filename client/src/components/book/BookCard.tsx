import { type ReactNode } from 'react';

type BookCardProps = {
  coverUrl?: string | null;
  title: string;
  titleLink?: string;
  author: string;
  topRight?: ReactNode;
  children?: ReactNode;
  className?: string;
};

function BookCard({
  coverUrl,
  title,
  titleLink,
  author,
  topRight,
  children,
  className = '',
}: BookCardProps) {
  return (
    <article className={`rounded-2xl border border-base-200 bg-base-100 p-5 ${className}`.trim()}>
      <div className="grid gap-5 lg:grid-cols-[100px_1fr_auto] lg:items-start">
        <div className="h-36 w-full overflow-hidden rounded-xl bg-base-200">
          {coverUrl
            ? (
                <img src={coverUrl} alt={title} className="h-full w-full object-cover" />
              )
            : (
                <div className="flex h-full items-center justify-center text-xs text-base-content/30">
                  No cover
                </div>
              )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              {titleLink
                ? (
                    <a href={titleLink} className="text-xl font-semibold text-base-content break-words hover:underline">
                      {title}
                    </a>
                  )
                : (
                    <h2 className="text-xl font-semibold text-base-content break-words">{title}</h2>
                  )}
              <p className="text-sm text-base-content/60 truncate">{author}</p>
            </div>
            {topRight && <div className="min-w-0 flex-shrink-0">{topRight}</div>}
          </div>
          {children}
        </div>
      </div>
    </article>
  );
}

export default BookCard;
