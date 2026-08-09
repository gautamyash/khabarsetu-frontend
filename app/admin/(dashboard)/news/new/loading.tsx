/** Mirrors EditNewsLoading — same two-column news form shape. */
export default function NewNewsLoading() {
  return (
    <div>
      <div className="h-7 w-28 animate-pulse rounded-sm bg-ink-100" />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="h-10 w-full animate-pulse rounded-sm bg-ink-100" />
          <div className="h-10 w-full animate-pulse rounded-sm bg-ink-100" />
          <div className="h-20 w-full animate-pulse rounded-sm bg-ink-100" />
          <div className="h-64 w-full animate-pulse rounded-sm bg-ink-100" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 w-full animate-pulse rounded-md bg-ink-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
