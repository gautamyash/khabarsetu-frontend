import { Search } from "lucide-react";
import { UI_TEXT } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Plain GET form — works without client-side JavaScript. Submits to
 * /search?q=... which the search route reads from searchParams. Styled as
 * a real search control (pill field + a distinct submit button) rather
 * than a bare input with a decorative icon.
 */
export function SearchForm({
  className,
  defaultValue,
}: {
  className?: string;
  defaultValue?: string;
}) {
  return (
    <form action="/search" method="get" className={cn("relative flex items-center", className)}>
      <label htmlFor="site-search" className="sr-only">
        {UI_TEXT.search}
      </label>
      <input
        id="site-search"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder={UI_TEXT.searchPlaceholder}
        className="w-full rounded-full border border-outline bg-surface-container-low py-2.5 pr-11 pl-4 text-[15px] text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <button
        type="submit"
        aria-label={UI_TEXT.search}
        className="absolute right-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-colors hover:opacity-90"
      >
        <Search className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}
