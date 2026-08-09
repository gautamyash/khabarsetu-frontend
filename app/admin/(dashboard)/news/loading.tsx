/** News list skeleton — mirrors the filter bar + table shape. */
export default function NewsListLoading() {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="h-7 w-24 animate-pulse rounded-sm bg-ink-100" />
        <div className="h-9 w-28 animate-pulse rounded-sm bg-ink-100" />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="h-9 w-full animate-pulse rounded-sm bg-ink-100 sm:w-56" />
        <div className="h-9 w-full animate-pulse rounded-sm bg-ink-100 sm:w-44" />
        <div className="h-9 w-full animate-pulse rounded-sm bg-ink-100 sm:w-40" />
      </div>

      <div className="mt-4 overflow-hidden rounded-md border border-ink-200 bg-white">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-ink-100 px-4 py-3 last:border-0">
            <div className="h-12 w-16 shrink-0 animate-pulse rounded-sm bg-ink-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/5 animate-pulse rounded-sm bg-ink-100" />
              <div className="h-3 w-1/4 animate-pulse rounded-sm bg-ink-100" />
            </div>
            <div className="hidden h-6 w-16 animate-pulse rounded-sm bg-ink-100 sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
