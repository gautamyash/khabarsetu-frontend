/** Dashboard skeleton — mirrors the stat-card grid + recent-news list shape
 * so the layout doesn't jump once real data arrives. */
export default function DashboardLoading() {
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="h-7 w-32 animate-pulse rounded-sm bg-ink-100" />
          <div className="mt-3 h-4 w-40 animate-pulse rounded-sm bg-ink-100" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded-sm bg-ink-100" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-md border border-ink-200 bg-white p-4">
            <div className="h-7 w-12 animate-pulse rounded-sm bg-ink-100" />
            <div className="mt-2 h-4 w-16 animate-pulse rounded-sm bg-ink-100" />
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="h-5 w-28 animate-pulse rounded-sm bg-ink-100" />
        <div className="mt-3 overflow-hidden rounded-md border border-ink-200 bg-white">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-ink-100 px-4 py-3 last:border-0">
              <div className="h-11 w-16 shrink-0 animate-pulse rounded-sm bg-ink-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded-sm bg-ink-100" />
                <div className="h-3 w-1/3 animate-pulse rounded-sm bg-ink-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
