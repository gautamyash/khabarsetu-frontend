import type { Metadata } from "next";
import { NewsForm } from "@/components/admin/NewsForm";
import { listCategories } from "@/lib/categories-api";
import { getAuthenticatedUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "नई खबर",
};

export default async function NewNewsPage() {
  const user = await getAuthenticatedUser();

  // Authoritative enforcement happens server-side (POST /api/v1/articles
  // requires ADMIN/EDITOR) — this is a frontend-level convenience so an
  // AUTHOR doesn't fill out the whole form only to have the API reject it.
  if (user && user.role === "author") {
    return (
      <div>
        <h1 className="font-serif-hi text-2xl font-bold text-ink-900">नई खबर</h1>
        <p className="mt-6 rounded-md border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700">
          खबर बनाने की अनुमति केवल व्यवस्थापक (Admin) और संपादक (Editor) को है।
        </p>
      </div>
    );
  }

  let categories: Awaited<ReturnType<typeof listCategories>> = [];
  let loadError: string | null = null;

  try {
    categories = await listCategories();
  } catch {
    loadError = "श्रेणियां लोड नहीं हो सकीं। कृपया पृष्ठ को पुनः लोड करें।";
  }

  return (
    <div>
      <h1 className="font-serif-hi text-2xl font-bold text-ink-900">नई खबर</h1>
      <div className="mt-6">
        {loadError ? (
          <p className="rounded-md border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700">
            {loadError}
          </p>
        ) : (
          <NewsForm categories={categories} />
        )}
      </div>
    </div>
  );
}
