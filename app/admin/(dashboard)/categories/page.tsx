import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { CategoryTable } from "@/components/admin/CategoryTable";
import { listCategories } from "@/lib/categories-api";

export const metadata: Metadata = {
  title: "श्रेणियां",
};

export default async function AdminCategoriesPage() {
  let categories: Awaited<ReturnType<typeof listCategories>> = [];
  let loadError: string | null = null;

  try {
    categories = await listCategories();
  } catch {
    loadError = "श्रेणियां लोड नहीं हो सकीं। कृपया पृष्ठ को पुनः लोड करें।";
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif-hi text-2xl font-bold text-ink-900">श्रेणियां</h1>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 rounded-sm bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
        >
          <Plus className="h-4 w-4" />
          नई श्रेणी
        </Link>
      </div>

      <div className="mt-6">
        {loadError ? (
          <p className="rounded-md border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700">
            {loadError}
          </p>
        ) : (
          <CategoryTable categories={categories} />
        )}
      </div>
    </div>
  );
}
