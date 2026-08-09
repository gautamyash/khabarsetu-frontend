import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="flex items-center justify-between border-t border-ink-200 pt-4">
      {hasPrev ? (
        <Link
          href={buildHref(page - 1)}
          className="rounded-sm border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
        >
          पिछला
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-sm border border-ink-100 px-4 py-2 text-sm font-medium text-ink-300">
          पिछला
        </span>
      )}

      <span className="text-sm text-ink-600">
        पृष्ठ {page} / {Math.max(totalPages, 1)}
      </span>

      {hasNext ? (
        <Link
          href={buildHref(page + 1)}
          className="rounded-sm border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
        >
          अगला
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-sm border border-ink-100 px-4 py-2 text-sm font-medium text-ink-300">
          अगला
        </span>
      )}
    </div>
  );
}
