import Link from "next/link";
import { FolderTree, Pencil } from "lucide-react";
import { DeleteCategoryButton } from "@/components/admin/DeleteCategoryButton";
import type { AdminCategory } from "@/types/category";

/** Renders as a table on md+ screens and as stacked cards on mobile, so the
 * admin panel stays usable on small screens without a horizontally-scrolling
 * table. */
export function CategoryTable({ categories }: { categories: AdminCategory[] }) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-md border border-dashed border-ink-200 bg-white px-6 py-14 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-50">
          <FolderTree className="h-6 w-6 text-ink-300" aria-hidden />
        </span>
        <p className="mt-3 text-sm font-medium text-ink-700">अभी कोई श्रेणी नहीं है</p>
        <p className="mt-1 text-xs text-ink-500">खबरों को व्यवस्थित करने के लिए पहली श्रेणी बनाएं।</p>
        <Link
          href="/admin/categories/new"
          className="mt-4 inline-flex items-center gap-1.5 rounded-sm bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        >
          + पहली श्रेणी जोड़ें
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-hidden rounded-md border border-ink-200 bg-white md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-200 bg-ink-50 text-left text-ink-600">
            <tr>
              <th className="px-4 py-3 font-medium">नाम</th>
              <th className="px-4 py-3 font-medium">स्लग</th>
              <th className="px-4 py-3 font-medium">खबरें</th>
              <th className="px-4 py-3 font-medium">कार्य</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-4 py-3 font-medium text-ink-900">{category.name}</td>
                <td className="px-4 py-3 text-ink-500">{category.slug}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-600">
                    {category.articleCount} खबरें
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/categories/${category.id}/edit`}
                      className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      संपादित करें
                    </Link>
                    <DeleteCategoryButton id={category.id} name={category.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {categories.map((category) => (
          <div key={category.id} className="rounded-md border border-ink-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-ink-900">{category.name}</p>
                <p className="mt-0.5 text-xs text-ink-500">{category.slug}</p>
              </div>
              <span className="shrink-0 rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-600">
                {category.articleCount} खबरें
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1 border-t border-ink-100 pt-3">
              <Link
                href={`/admin/categories/${category.id}/edit`}
                className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
              >
                <Pencil className="h-3.5 w-3.5" />
                संपादित करें
              </Link>
              <DeleteCategoryButton id={category.id} name={category.name} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
