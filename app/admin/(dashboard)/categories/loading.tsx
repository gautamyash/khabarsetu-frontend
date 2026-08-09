/** Categories list skeleton — mirrors the table shape. */
export default function CategoriesLoading() {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="h-7 w-28 animate-pulse rounded-sm bg-ink-100" />
        <div className="h-9 w-32 animate-pulse rounded-sm bg-ink-100" />
      </div>

      <div className="mt-6 overflow-hidden rounded-md border border-ink-200 bg-white">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-ink-100 px-4 py-3 last:border-0">
            <div className="h-4 w-1/4 animate-pulse rounded-sm bg-ink-100" />
            <div className="h-4 w-1/5 animate-pulse rounded-sm bg-ink-100" />
            <div className="h-4 w-10 animate-pulse rounded-sm bg-ink-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
