import type { Metadata } from "next";
import { NewsForm } from "@/components/admin/NewsForm";
import { ApiError } from "@/lib/api-error";
import { getArticle } from "@/lib/articles-api";
import { listCategories } from "@/lib/categories-api";
import { getAuthenticatedUser, getSessionToken } from "@/lib/session";

export const metadata: Metadata = {
  title: "खबर संपादित करें",
};

function Denied({ message }: { message: string }) {
  return (
    <div>
      <h1 className="font-serif-hi text-2xl font-bold text-ink-900">खबर संपादित करें</h1>
      <p className="mt-6 rounded-md border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700">
        {message}
      </p>
    </div>
  );
}

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthenticatedUser();

  // Authoritative enforcement happens server-side (PUT /api/v1/articles/{id}
  // requires ADMIN/EDITOR) — this is a frontend-level convenience so an
  // AUTHOR doesn't fill out the whole form only to have the API reject it.
  if (user && user.role === "author") {
    return <Denied message="आपको इस खबर को संपादित करने की अनुमति नहीं है।" />;
  }

  const token = await getSessionToken();
  if (!token) {
    return <Denied message="आपको इस खबर को संपादित करने की अनुमति नहीं है।" />;
  }

  let article: Awaited<ReturnType<typeof getArticle>> | null = null;
  let notFoundMessage: string | null = null;
  let genericError: string | null = null;

  try {
    article = await getArticle(token, id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFoundMessage = "खबर नहीं मिली।";
    } else if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      notFoundMessage = "आपको इस खबर को संपादित करने की अनुमति नहीं है।";
    } else {
      genericError = "खबर लोड नहीं हो सकी। कृपया पृष्ठ को पुनः लोड करें।";
    }
  }

  if (!article) {
    return <Denied message={notFoundMessage ?? genericError ?? "खबर नहीं मिली।"} />;
  }

  let categories: Awaited<ReturnType<typeof listCategories>> = [];
  let categoriesError: string | null = null;

  try {
    categories = await listCategories();
  } catch {
    categoriesError = "श्रेणियां लोड नहीं हो सकीं। कृपया पृष्ठ को पुनः लोड करें।";
  }

  return (
    <div>
      <h1 className="font-serif-hi text-2xl font-bold text-ink-900">खबर संपादित करें</h1>
      <div className="mt-6">
        {categoriesError ? (
          <p className="rounded-md border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700">
            {categoriesError}
          </p>
        ) : (
          <NewsForm categories={categories} article={article} />
        )}
      </div>
    </div>
  );
}
