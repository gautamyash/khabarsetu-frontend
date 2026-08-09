import Link from "next/link";
import { Minus, Pencil, Star, Zap } from "lucide-react";
import { ARTICLE_STATUS_CONFIG } from "@/lib/admin-constants";
import { DeleteArticleButton } from "@/components/admin/DeleteArticleButton";
import { PublishToggleButton } from "@/components/admin/PublishToggleButton";
import { formatHindiDate } from "@/lib/utils";
import type { AdminArticle } from "@/types/article";

function StatusBadge({ status }: { status: AdminArticle["status"] }) {
  const config = ARTICLE_STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${config.badgeClassName}`}>
      {config.label}
    </span>
  );
}

function BreakingIndicator({ active }: { active: boolean }) {
  if (!active) return <Minus className="h-3.5 w-3.5 text-ink-300" aria-hidden />;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
      <Zap className="h-3 w-3" aria-hidden />
      ब्रेकिंग
    </span>
  );
}

function FeaturedIndicator({ active }: { active: boolean }) {
  if (!active) return <Minus className="h-3.5 w-3.5 text-ink-300" aria-hidden />;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
      <Star className="h-3 w-3" aria-hidden />
      फीचर्ड
    </span>
  );
}

function Thumb({ article }: { article: AdminArticle }) {
  if (!article.featuredImage) {
    return <div className="h-12 w-16 shrink-0 rounded-sm bg-ink-100" />;
  }
  return (
    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-sm bg-ink-100">
      {/* Plain <img> rather than next/image: the featured image can be an
          arbitrary URL from the database (no media upload system yet), and
          next/image requires known domains to be allow-listed. This is an
          internal admin thumbnail, not a public LCP-critical image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={article.featuredImage} alt="" className="h-full w-full object-cover" />
    </div>
  );
}

export function NewsTable({ articles }: { articles: AdminArticle[] }) {
  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-md border border-dashed border-ink-200 bg-white px-6 py-14 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-50">
          <Pencil className="h-5 w-5 text-ink-300" aria-hidden />
        </span>
        <p className="mt-3 text-sm font-medium text-ink-700">इस फ़िल्टर से कोई खबर नहीं मिली</p>
        <p className="mt-1 text-xs text-ink-500">खोज या फ़िल्टर बदलकर देखें, या एक नई खबर जोड़ें।</p>
        <Link
          href="/admin/news/new"
          className="mt-4 inline-flex items-center gap-1.5 rounded-sm bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        >
          + नई खबर जोड़ें
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto rounded-md border border-ink-200 bg-white md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-200 bg-ink-50 text-left text-ink-600">
            <tr>
              <th className="px-4 py-3 font-medium">मुख्य फोटो</th>
              <th className="px-4 py-3 font-medium">शीर्षक</th>
              <th className="px-4 py-3 font-medium">श्रेणी</th>
              <th className="px-4 py-3 font-medium">स्थिति</th>
              <th className="px-4 py-3 font-medium">ब्रेकिंग</th>
              <th className="px-4 py-3 font-medium">फीचर्ड</th>
              <th className="px-4 py-3 font-medium">प्रकाशन तिथि</th>
              <th className="px-4 py-3 font-medium">कार्य</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {articles.map((article) => (
              <tr key={article.id}>
                <td className="px-4 py-3">
                  <Thumb article={article} />
                </td>
                <td className="max-w-xs px-4 py-3 font-medium text-ink-900">{article.title}</td>
                <td className="px-4 py-3 text-ink-600">{article.category?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={article.status} />
                </td>
                <td className="px-4 py-3">
                  <BreakingIndicator active={article.isBreaking} />
                </td>
                <td className="px-4 py-3">
                  <FeaturedIndicator active={article.isFeatured} />
                </td>
                <td className="px-4 py-3 text-ink-500">
                  {article.publishedAt ? formatHindiDate(article.publishedAt) : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-1">
                    <Link
                      href={`/admin/news/${article.id}/edit`}
                      className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      संपादित करें
                    </Link>
                    <PublishToggleButton id={article.id} status={article.status} />
                    <DeleteArticleButton id={article.id} title={article.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {articles.map((article) => (
          <div key={article.id} className="rounded-md border border-ink-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <Thumb article={article} />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink-900">{article.title}</p>
                <p className="mt-0.5 text-xs text-ink-500">{article.category?.name ?? "—"}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={article.status} />
                  {article.isBreaking && <BreakingIndicator active />}
                  {article.isFeatured && <FeaturedIndicator active />}
                </div>
                {article.publishedAt && (
                  <p className="mt-1.5 text-xs text-ink-400">{formatHindiDate(article.publishedAt)}</p>
                )}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-ink-100 pt-3">
              <Link
                href={`/admin/news/${article.id}/edit`}
                className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
              >
                <Pencil className="h-3.5 w-3.5" />
                संपादित करें
              </Link>
              <PublishToggleButton id={article.id} status={article.status} />
              <DeleteArticleButton id={article.id} title={article.title} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
