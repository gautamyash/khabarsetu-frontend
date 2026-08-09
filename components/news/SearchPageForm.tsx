import { Search } from "lucide-react";

/**
 * The search page's own large query input — matches the Stitch `Search`
 * reference's oversized bordered search field. Deliberately a separate
 * component from components/layout/SearchForm.tsx (the pill-shaped
 * header/mobile-menu search control), which stays untouched since it's
 * shared with the global Header — restyling it here would have changed
 * the mobile menu on every page, including the homepage. Same plain GET
 * form as before: no client JavaScript required.
 */
export function SearchPageForm({ defaultValue }: { defaultValue?: string }) {
  return (
    <form action="/search" method="get" className="relative max-w-3xl">
      <label htmlFor="search-page-q" className="sr-only">
        खोजें
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-secondary"
        aria-hidden
      />
      <input
        id="search-page-q"
        name="q"
        type="text"
        defaultValue={defaultValue}
        placeholder="खोजें..."
        className="w-full border border-outline bg-surface-container-low py-4 pr-4 pl-12 text-lg text-on-surface placeholder:text-on-surface-variant focus:border-transparent focus:ring-2 focus:ring-primary focus:outline-none"
      />
    </form>
  );
}
