/** Media library skeleton — mirrors the upload button + image grid shape. */
export default function MediaLoading() {
  return (
    <div>
      <div className="h-7 w-20 animate-pulse rounded-sm bg-ink-100" />
      <div className="mt-2 h-4 w-64 animate-pulse rounded-sm bg-ink-100" />
      <div className="mt-6 h-9 w-40 animate-pulse rounded-sm bg-ink-100" />

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-md border border-ink-200 bg-white">
            <div className="aspect-video w-full animate-pulse bg-ink-100" />
            <div className="space-y-1.5 p-2.5">
              <div className="h-3 w-4/5 animate-pulse rounded-sm bg-ink-100" />
              <div className="h-3 w-2/5 animate-pulse rounded-sm bg-ink-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
