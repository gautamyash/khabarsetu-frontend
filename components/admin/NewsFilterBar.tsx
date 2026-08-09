import { ARTICLE_STATUS_OPTIONS } from "@/lib/admin-constants";
import type { AdminCategory } from "@/types/category";

/** Plain server-rendered GET form — no client JS needed. Submitting resets
 * pagination to page 1 (the `page` param is simply omitted). */
const SELECT_CLASS =
  "w-full rounded-sm border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export function NewsFilterBar({
  categories,
  defaultValues,
}: {
  categories: AdminCategory[];
  defaultValues: { search?: string; categoryId?: string; status?: string; isBreaking?: string };
}) {
  return (
    <form method="get" className="flex flex-col gap-3 rounded-md border border-ink-200 bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center">
      <input
        type="search"
        name="search"
        defaultValue={defaultValues.search}
        placeholder="खबर खोजें..."
        className="w-full rounded-sm border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:w-56"
      />
      <select name="category_id" defaultValue={defaultValues.categoryId ?? ""} className={`${SELECT_CLASS} sm:w-44`}>
        <option value="">सभी श्रेणियां</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <select name="status" defaultValue={defaultValues.status ?? ""} className={`${SELECT_CLASS} sm:w-40`}>
        <option value="">सभी स्थिति</option>
        {ARTICLE_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select name="is_breaking" defaultValue={defaultValues.isBreaking ?? ""} className={`${SELECT_CLASS} sm:w-40`}>
        <option value="">सभी खबरें</option>
        <option value="true">केवल ब्रेकिंग</option>
        <option value="false">गैर-ब्रेकिंग</option>
      </select>
      <button
        type="submit"
        className="rounded-sm bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
      >
        फ़िल्टर करें
      </button>
    </form>
  );
}
