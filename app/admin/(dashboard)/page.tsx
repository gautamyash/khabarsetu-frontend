import Link from "next/link";
import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  FileText,
  FolderPlus,
  FolderTree,
  Inbox,
  Newspaper,
  Pencil,
  Plus,
  SquarePen,
  Upload,
  Zap,
} from "lucide-react";
import { getAuthenticatedUser, getSessionToken } from "@/lib/session";
import { listArticles } from "@/lib/articles-api";
import { listCategories } from "@/lib/categories-api";
import { ARTICLE_STATUS_CONFIG } from "@/lib/admin-constants";
import { formatHindiWeekdayDate, formatRelativeHindi } from "@/lib/utils";

export const metadata: Metadata = {
  title: "डैशबोर्ड",
};

interface DashboardStats {
  totalArticles: number;
  publishedCount: number;
  draftCount: number;
  breakingCount: number;
  totalCategories: number;
  recent: Awaited<ReturnType<typeof listArticles>>["items"];
}

async function loadStats(token: string): Promise<DashboardStats> {
  const [total, published, draft, breakingPublished, breakingDraft, categories, recent] = await Promise.all([
    listArticles(token, { limit: 1 }),
    listArticles(token, { status: "published", limit: 1 }),
    listArticles(token, { status: "draft", limit: 1 }),
    // "ब्रेकिंग न्यूज़" should reflect live breaking news only — an archived
    // article that still happens to be flagged is_breaking shouldn't count,
    // so this is summed from draft+published rather than an unfiltered
    // (by status) breaking count.
    listArticles(token, { status: "published", isBreaking: true, limit: 1 }),
    listArticles(token, { status: "draft", isBreaking: true, limit: 1 }),
    listCategories(),
    listArticles(token, { limit: 5 }),
  ]);

  return {
    totalArticles: total.total,
    publishedCount: published.total,
    draftCount: draft.total,
    breakingCount: breakingPublished.total + breakingDraft.total,
    totalCategories: categories.length,
    recent: recent.items,
  };
}

export default async function AdminDashboardPage() {
  const user = await getAuthenticatedUser();
  const token = await getSessionToken();

  let stats: DashboardStats | null = null;
  let statsError: string | null = null;

  if (token) {
    try {
      stats = await loadStats(token);
    } catch {
      statsError = "आँकड़े लोड नहीं हो सके।";
    }
  } else {
    statsError = "आँकड़े लोड नहीं हो सके।";
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
            {formatHindiWeekdayDate(new Date())}
          </p>
          <h1 className="font-serif-hi mt-1 text-2xl font-bold text-ink-900">
            स्वागत है{user ? `, ${user.name}` : ""}
          </h1>
        </div>
        <Link
          href="/admin/news/new"
          className="flex items-center gap-2 rounded-sm bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-800"
        >
          <Plus className="h-4 w-4" />
          नई खबर
        </Link>
      </div>

      {statsError ? (
        <p className="mt-6 rounded-md border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700">
          {statsError}
        </p>
      ) : (
        stats && (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
              <StatCard icon={Newspaper} label="कुल खबरें" value={stats.totalArticles} context="सभी स्थितियों में" />
              <StatCard
                icon={CheckCircle2}
                label="प्रकाशित"
                value={stats.publishedCount}
                context="लाइव खबरें"
                tone="published"
              />
              <StatCard
                icon={FileText}
                label="ड्राफ्ट"
                value={stats.draftCount}
                context="समीक्षा में"
                tone="draft"
              />
              <StatCard
                icon={Zap}
                label="ब्रेकिंग न्यूज़"
                value={stats.breakingCount}
                context="चिह्नित खबरें"
                tone="breaking"
              />
              <StatCard icon={FolderTree} label="कुल श्रेणियां" value={stats.totalCategories} context="सक्रिय श्रेणियां" />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <h2 className="font-serif-hi text-lg font-bold text-ink-900">हाल की खबरें</h2>
                <div className="mt-3 overflow-hidden rounded-md border border-ink-200 bg-white">
                  {stats.recent.length === 0 ? (
                    <div className="flex flex-col items-center px-4 py-14 text-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-50">
                        <Inbox className="h-6 w-6 text-ink-300" aria-hidden />
                      </span>
                      <p className="mt-3 text-sm font-medium text-ink-700">अभी कोई खबर नहीं है</p>
                      <p className="mt-1 max-w-xs text-xs text-ink-500">
                        पहली खबर प्रकाशित करने के लिए नीचे दिए गए बटन का उपयोग करें।
                      </p>
                      <Link
                        href="/admin/news/new"
                        className="mt-4 inline-flex items-center gap-1.5 rounded-sm bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        नई खबर जोड़ें
                      </Link>
                    </div>
                  ) : (
                    <ul className="divide-y divide-ink-100">
                      {stats.recent.map((article) => {
                        const statusConfig = ARTICLE_STATUS_CONFIG[article.status];
                        return (
                          <li key={article.id} className="flex items-center gap-3 px-4 py-3">
                            <div className="h-11 w-16 shrink-0 overflow-hidden rounded-sm bg-ink-100">
                              {article.featuredImage && (
                                // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail, arbitrary backend-hosted URL
                                <img
                                  src={article.featuredImage}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-ink-900">{article.title}</p>
                              <div className="mt-1 flex items-center gap-2">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.badgeClassName}`}
                                >
                                  {statusConfig.label}
                                </span>
                                <span className="text-xs text-ink-500">{article.category?.name ?? "—"}</span>
                              </div>
                            </div>
                            <span className="hidden shrink-0 text-xs text-ink-400 sm:block">
                              {formatRelativeHindi(article.createdAt)}
                            </span>
                            <Link
                              href={`/admin/news/${article.id}/edit`}
                              aria-label={`"${article.title}" संपादित करें`}
                              title="संपादित करें"
                              className="shrink-0 rounded-sm p-2 text-ink-500 transition-colors hover:bg-ink-50 hover:text-brand-700"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                <Link
                  href="/admin/news"
                  className="mt-3 inline-block text-sm font-medium text-brand-700 hover:underline"
                >
                  सभी खबरें देखें →
                </Link>
              </div>

              <div>
                <h2 className="font-serif-hi text-lg font-bold text-ink-900">त्वरित कार्य</h2>
                <div className="mt-3 flex flex-col gap-2">
                  <QuickAction href="/admin/news/new" icon={SquarePen} label="नई खबर लिखें" />
                  <QuickAction href="/admin/media" icon={Upload} label="मीडिया अपलोड करें" />
                  <QuickAction href="/admin/categories" icon={FolderPlus} label="श्रेणी जोड़ें" />
                </div>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}

const STAT_TONE_CLASSES: Record<string, string> = {
  default: "bg-ink-50 text-ink-500",
  published: "bg-emerald-50 text-emerald-600",
  draft: "bg-amber-50 text-amber-600",
  breaking: "bg-brand-50 text-brand-700",
};

function StatCard({
  icon: Icon,
  label,
  value,
  context,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  context: string;
  tone?: keyof typeof STAT_TONE_CLASSES;
}) {
  return (
    <div className="rounded-md border border-ink-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-2xl font-bold text-ink-900">{value}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${STAT_TONE_CLASSES[tone]}`}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <p className="mt-2 text-sm font-medium text-ink-700">{label}</p>
      <p className="mt-0.5 text-xs text-ink-400">{context}</p>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-md border border-ink-200 bg-white px-4 py-3 text-sm font-medium text-ink-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-50 text-ink-500">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      {label}
    </Link>
  );
}
