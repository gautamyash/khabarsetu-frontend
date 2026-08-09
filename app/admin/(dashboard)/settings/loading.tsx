/** Settings skeleton — mirrors the sectioned form shape. */
export default function SettingsLoading() {
  return (
    <div>
      <div className="h-7 w-24 animate-pulse rounded-sm bg-ink-100" />
      <div className="mt-2 h-4 w-72 animate-pulse rounded-sm bg-ink-100" />

      <div className="mt-6 max-w-2xl space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-md border border-ink-200 bg-white p-5">
            <div className="h-4 w-32 animate-pulse rounded-sm bg-ink-100" />
            <div className="mt-4 space-y-3">
              <div className="h-9 w-full animate-pulse rounded-sm bg-ink-100" />
              <div className="h-9 w-full animate-pulse rounded-sm bg-ink-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
