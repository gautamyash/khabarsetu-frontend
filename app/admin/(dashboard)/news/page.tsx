import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { NewsFilterBar } from "@/components/admin/NewsFilterBar";
import { NewsTable } from "@/components/admin/NewsTable";
import { Pagination } from "@/components/admin/Pagination";
import { listArticles } from "@/lib/articles-api";
import { listCategories } from "@/lib/categories-api";
import { getSessionToken } from "@/lib/session";
import type { ArticleStatus } from "@/types/article";

export const metadata: Metadata = {
  title: "खबरें",
};

const VALID_STATUSES: ArticleStatus[] = ["draft", "published", "archived"];

function buildHref(
  base: string,
  params: { search?: string; categoryId?: string; status?: string; isBreaking?: boolean },
  page: number
): string {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.categoryId) query.set("category_id", params.categoryId);
  if (params.status) query.set("status", params.status);
  if (params.isBreaking !== undefined) query.set("is_breaking", String(params.isBreaking));
  if (page > 1) query.set("page", String(page));
  const qs = query.toString();
  return qs ? `${base}?${qs}` : base;
}

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    category_id?: string;
    status?: string;
    is_breaking?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const search = params.search?.trim() || undefined;
  const categoryId = params.category_id || undefined;
  const status = VALID_STATUSES.includes(params.status as ArticleStatus)
    ? (params.status as ArticleStatus)
    : undefined;
  const isBreaking =
    params.is_breaking === "true" ? true : params.is_breaking === "false" ? false : undefined;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const token = await getSessionToken();

  let categories: Awaited<ReturnType<typeof listCategories>> = [];
  let result: Awaited<ReturnType<typeof listArticles>> | null = null;
  let loadError: string | null = null;

  try {
    [categories, result] = await Promise.all([
      listCategories(),
      token
        ? listArticles(token, { search, categoryId, status, isBreaking, page })
        : Promise.reject(new Error("no session")),
    ]);
  } catch {
    loadError = "खबरें लोड नहीं हो सकीं। कृपया पृष्ठ को पुनः लोड करें।";
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif-hi text-2xl font-bold text-ink-900">खबरें</h1>
        <Link
          href="/admin/news/new"
          className="flex items-center gap-2 rounded-sm bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
        >
          <Plus className="h-4 w-4" />
          नई खबर
        </Link>
      </div>

      <div className="mt-6">
        <NewsFilterBar
          categories={categories}
          defaultValues={{ search, categoryId, status, isBreaking: params.is_breaking }}
        />
      </div>

      <div className="mt-4">
        {loadError || !result ? (
          <p className="rounded-md border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700">
            {loadError ?? "खबरें लोड नहीं हो सकीं।"}
          </p>
        ) : (
          <>
            <NewsTable articles={result.items} />
            {result.items.length > 0 && (
              <div className="mt-4">
                <Pagination
                  page={result.page}
                  totalPages={result.totalPages}
                  buildHref={(p) => buildHref("/admin/news", { search, categoryId, status, isBreaking }, p)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
