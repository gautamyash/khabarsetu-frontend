import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { ApiError } from "@/lib/api-error";
import { getCategory } from "@/lib/categories-api";

export const metadata: Metadata = {
  title: "श्रेणी संपादित करें",
};

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const category = await getCategory(id);
    return (
      <div>
        <h1 className="font-serif-hi text-2xl font-bold text-ink-900">श्रेणी संपादित करें</h1>
        <div className="mt-6">
          <CategoryForm category={category} />
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    return (
      <p className="rounded-md border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700">
        श्रेणी लोड नहीं हो सकी। कृपया पृष्ठ को पुनः लोड करें।
      </p>
    );
  }
}
