"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  BarChart3,
  Clock,
  Download,
  Eye,
  FileText,
  Flame,
  Newspaper,
  Radio,
  Search as SearchIcon,
  TrendingUp,
  TriangleAlert,
  Users,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/analytics/StatCard";
import { LineChart } from "@/components/analytics/LineChart";
import { BarList } from "@/components/analytics/BarList";
import { DateRangeFilter } from "@/components/analytics/DateRangeFilter";
import { cn, formatRelativeHindi } from "@/lib/utils";
import type {
  AnalyticsDevices,
  AnalyticsOverview,
  AnalyticsPublishing,
  AnalyticsSearch,
  AnalyticsSources,
  AnalyticsTraffic,
  ArticleAnalyticsListItem,
  ArticleAnalyticsSort,
  AnalyticsRealtime,
  CategoryAnalyticsItem,
  DateRangePreset,
  TrafficMetric,
} from "@/types/analytics";
import type { Page } from "@/types/pagination";

/**
 * The whole /admin/analytics dashboard. A client component (not a Server
 * Component page) because almost every section here is interactive — date
 * range, metric switcher, sortable article table — and re-fetches through
 * this app's own BFF routes (app/api/admin/analytics/*) rather than
 * calling the backend directly, matching the rest of the admin panel.
 *
 * Fetch strategy: one Promise.all covers everything that's scoped to the
 * date range (overview/traffic/categories/sources/devices/search/
 * publishing); the article table has its own loading flag so switching
 * its sort/filter doesn't reload the whole page; the realtime panel polls
 * independently on a short interval regardless of the selected date range
 * (it is, by definition, not date-range-scoped).
 */

const REALTIME_POLL_MS = 20_000;
const ARTICLES_PAGE_SIZE = 10;

const METRIC_OPTIONS: { value: TrafficMetric; label: string }[] = [
  { value: "visitors", label: "विज़िट्स" },
  { value: "unique_visitors", label: "यूनिक विज़िटर्स" },
  { value: "page_views", label: "पेज व्यू" },
  { value: "sessions", label: "सेशन" },
];

const SORT_OPTIONS: { value: ArticleAnalyticsSort; label: string }[] = [
  { value: "views", label: "सबसे ज़्यादा व्यूज़" },
  { value: "unique_visitors", label: "सबसे ज़्यादा यूनिक विज़िटर्स" },
  { value: "trending", label: "ट्रेंडिंग (7 दिन)" },
  { value: "recent", label: "हाल ही में प्रकाशित" },
];

function fmtNum(n: number): string {
  return n.toLocaleString("hi-IN");
}

function fmtDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")} मिनट`;
}

function fmtPct(n: number | null): string {
  if (n === null) return "—";
  return `${n.toLocaleString("hi-IN")}%`;
}

interface RangeState {
  preset: DateRangePreset;
  startDate: string;
  endDate: string;
}

function rangeQuery(range: RangeState): string {
  const params = new URLSearchParams({ preset: range.preset });
  if (range.preset === "custom") {
    if (range.startDate) params.set("startDate", range.startDate);
    if (range.endDate) params.set("endDate", range.endDate);
  }
  return params.toString();
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "same-origin" });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message || "डेटा लोड नहीं हो सका।");
  }
  return res.json() as Promise<T>;
}

function LoadingBlock({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center border border-ink-100 bg-ink-50/50 py-16 text-sm text-ink-400">
      {label ?? "लोड हो रहा है..."}
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="border border-ink-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-serif-hi text-lg font-bold text-ink-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const METRIC_GETTERS: Record<TrafficMetric, (p: AnalyticsTraffic["points"][number]) => number> = {
  visitors: (p) => p.visitors,
  unique_visitors: (p) => p.uniqueVisitors,
  page_views: (p) => p.pageViews,
  sessions: (p) => p.sessions,
};

export function AnalyticsDashboard() {
  const [range, setRange] = useState<RangeState>({ preset: "last_30_days", startDate: "", endDate: "" });
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [traffic, setTraffic] = useState<AnalyticsTraffic | null>(null);
  const [categories, setCategories] = useState<CategoryAnalyticsItem[] | null>(null);
  const [sources, setSources] = useState<AnalyticsSources | null>(null);
  const [devices, setDevices] = useState<AnalyticsDevices | null>(null);
  const [searchAnalytics, setSearchAnalytics] = useState<AnalyticsSearch | null>(null);
  const [publishing, setPublishing] = useState<AnalyticsPublishing | null>(null);

  const [trafficMetric, setTrafficMetric] = useState<TrafficMetric>("visitors");

  const [articlesPage, setArticlesPage] = useState<Page<ArticleAnalyticsListItem> | null>(null);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articleSort, setArticleSort] = useState<ArticleAnalyticsSort>("views");
  const [breakingOnly, setBreakingOnly] = useState(false);
  const [articlePageNum, setArticlePageNum] = useState(1);

  const [realtime, setRealtime] = useState<AnalyticsRealtime | null>(null);

  // Main, date-range-scoped fetch.
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setErrorMessage(null);

    const query = rangeQuery(range);
    Promise.all([
      fetchJson<AnalyticsOverview>(`/api/admin/analytics/overview`),
      fetchJson<AnalyticsTraffic>(`/api/admin/analytics/traffic?${query}`),
      fetchJson<CategoryAnalyticsItem[]>(`/api/admin/analytics/categories?${query}`),
      fetchJson<AnalyticsSources>(`/api/admin/analytics/sources?${query}`),
      fetchJson<AnalyticsDevices>(`/api/admin/analytics/devices?${query}`),
      fetchJson<AnalyticsSearch>(`/api/admin/analytics/search?${query}`),
      fetchJson<AnalyticsPublishing>(`/api/admin/analytics/publishing?${query}`),
    ])
      .then(([ov, tr, cat, src, dev, srch, pub]) => {
        if (cancelled) return;
        setOverview(ov);
        setTraffic(tr);
        setCategories(cat);
        setSources(src);
        setDevices(dev);
        setSearchAnalytics(srch);
        setPublishing(pub);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setErrorMessage(error instanceof Error ? error.message : "डेटा लोड नहीं हो सका।");
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.preset, range.startDate, range.endDate]);

  // Article table — independent loading state so sort/filter/page changes
  // don't reload the whole dashboard.
  useEffect(() => {
    let cancelled = false;
    setArticlesLoading(true);

    const query = rangeQuery(range);
    const params = new URLSearchParams(query);
    params.set("page", String(articlePageNum));
    params.set("limit", String(ARTICLES_PAGE_SIZE));
    params.set("sort", articleSort);
    if (breakingOnly) params.set("breakingOnly", "true");

    fetchJson<Page<ArticleAnalyticsListItem>>(`/api/admin/analytics/articles?${params.toString()}`)
      .then((data) => {
        if (cancelled) return;
        setArticlesPage(data);
      })
      .catch(() => {
        if (cancelled) return;
        setArticlesPage(null);
      })
      .finally(() => {
        if (!cancelled) setArticlesLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.preset, range.startDate, range.endDate, articleSort, breakingOnly, articlePageNum]);

  // Realtime — polls independently of the date range filter.
  const loadRealtime = useCallback(() => {
    fetchJson<AnalyticsRealtime>("/api/admin/analytics/realtime")
      .then(setRealtime)
      .catch(() => {
        // Realtime is a nice-to-have panel — a failed poll just keeps
        // showing the last known values instead of surfacing an error.
      });
  }, []);

  useEffect(() => {
    loadRealtime();
    const interval = setInterval(loadRealtime, REALTIME_POLL_MS);
    return () => clearInterval(interval);
  }, [loadRealtime]);

  function handleRangeChange(next: RangeState) {
    setArticlePageNum(1);
    setRange(next);
  }

  const exportQuery = rangeQuery(range);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif-hi flex items-center gap-2 text-2xl font-extrabold text-ink-900">
            <BarChart3 className="h-6 w-6 text-brand-700" aria-hidden />
            एनालिटिक्स
          </h1>
          <p className="mt-1 text-sm text-ink-500">वास्तविक विज़िटर डेटा पर आधारित — कोई काल्पनिक आंकड़े नहीं।</p>
        </div>
        <DateRangeFilter
          preset={range.preset}
          startDate={range.startDate}
          endDate={range.endDate}
          onChange={handleRangeChange}
        />
      </div>

      {status === "loading" && <LoadingBlock label="एनालिटिक्स लोड हो रही है..." />}

      {status === "error" && (
        <EmptyState icon={TriangleAlert} size="lg" title="डेटा लोड नहीं हो सका" message={errorMessage ?? undefined} />
      )}

      {status === "ready" && overview && (
        <>
          {/* Section 1 — KPI overview */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <StatCard label="कुल विज़िट्स" value={fmtNum(overview.totalVisits)} icon={Users} highlight />
            <StatCard label="यूनिक विज़िटर्स" value={fmtNum(overview.uniqueVisitors)} icon={Users} />
            <StatCard label="कुल पेज व्यू" value={fmtNum(overview.totalPageViews)} icon={Eye} />
            <StatCard
              label="आज के विज़िटर्स"
              value={fmtNum(overview.todayVisitors)}
              icon={Users}
              changePct={overview.todayVsYesterday.visitors.changePct}
              changeLabel="कल की तुलना में"
            />
            <StatCard
              label="आज के पेज व्यू"
              value={fmtNum(overview.todayPageViews)}
              icon={Eye}
              changePct={overview.todayVsYesterday.pageViews.changePct}
              changeLabel="कल की तुलना में"
            />
            <StatCard
              label="इस महीने के विज़िटर्स"
              value={fmtNum(overview.monthVisitors)}
              icon={Users}
              changePct={overview.monthVsLastMonth.visitors.changePct}
              changeLabel="पिछले महीने की तुलना में"
            />
            <StatCard
              label="इस महीने के पेज व्यू"
              value={fmtNum(overview.monthPageViews)}
              icon={Eye}
              changePct={overview.monthVsLastMonth.pageViews.changePct}
              changeLabel="पिछले महीने की तुलना में"
            />
            <StatCard
              label="इस साल के विज़िटर्स"
              value={fmtNum(overview.yearVisitors)}
              icon={Users}
              changePct={overview.yearVsLastYear.visitors.changePct}
              changeLabel="पिछले साल की तुलना में"
            />
            <StatCard
              label="इस साल के पेज व्यू"
              value={fmtNum(overview.yearPageViews)}
              icon={Eye}
              changePct={overview.yearVsLastYear.pageViews.changePct}
              changeLabel="पिछले साल की तुलना में"
            />
            <StatCard label="औसत सेशन अवधि" value={fmtDuration(overview.avgSessionDurationSeconds)} icon={Clock} />
            <StatCard label="बाउंस रेट" value={fmtPct(overview.bounceRate)} icon={TrendingUp} />
            <StatCard label="प्रकाशित खबरें" value={fmtNum(overview.publishedArticlesCount)} icon={Newspaper} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="border border-ink-200 bg-white p-4">
              <p className="text-xs font-bold tracking-wide text-ink-500 uppercase">सबसे ज्यादा देखी गई खबर</p>
              {overview.mostViewedArticle ? (
                <Link
                  href={`/admin/analytics/articles/${overview.mostViewedArticle.id}`}
                  className="mt-1 block font-semibold text-ink-900 hover:text-brand-700"
                >
                  {overview.mostViewedArticle.title}
                  <span className="ml-2 text-xs font-bold text-ink-400">{fmtNum(overview.mostViewedArticle.views)} व्यूज़</span>
                </Link>
              ) : (
                <p className="mt-1 text-sm text-ink-400">अभी उपलब्ध नहीं</p>
              )}
            </div>
            <div className="border border-ink-200 bg-white p-4">
              <p className="text-xs font-bold tracking-wide text-ink-500 uppercase">सबसे ज्यादा पढ़ी गई श्रेणी</p>
              {overview.topCategory ? (
                <p className="mt-1 font-semibold text-ink-900">
                  {overview.topCategory.name}
                  <span className="ml-2 text-xs font-bold text-ink-400">{fmtNum(overview.topCategory.views)} व्यूज़</span>
                </p>
              ) : (
                <p className="mt-1 text-sm text-ink-400">अभी उपलब्ध नहीं</p>
              )}
            </div>
          </div>

          {/* Trending */}
          {overview.trending.length > 0 && (
            <Panel title="ट्रेंडिंग खबरें">
              <ul className="divide-y divide-ink-100">
                {overview.trending.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
                    <Link href={`/admin/analytics/articles/${item.id}`} className="flex items-center gap-2 font-semibold text-ink-800 hover:text-brand-700">
                      <Flame className="h-4 w-4 shrink-0 text-brand-700" aria-hidden />
                      <span className="line-clamp-1">{item.title}</span>
                    </Link>
                    <span className="shrink-0 text-xs font-bold text-emerald-600">+{item.velocityPct.toLocaleString("hi-IN")}%</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {/* Section 3 — Traffic chart */}
          {traffic && (
            <Panel
              title="ट्रैफिक ओवरव्यू"
              action={
                <div className="flex gap-1">
                  {METRIC_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTrafficMetric(opt.value)}
                      className={
                        trafficMetric === opt.value
                          ? "bg-brand-700 px-2.5 py-1 text-xs font-bold text-white"
                          : "bg-ink-100 px-2.5 py-1 text-xs font-bold text-ink-600 hover:bg-ink-200"
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              }
            >
              {traffic.points.length > 0 ? (
                <LineChart
                  ariaLabel="समय के साथ ट्रैफिक"
                  data={traffic.points.map((p) => ({ label: p.bucket, value: METRIC_GETTERS[trafficMetric](p) }))}
                />
              ) : (
                <EmptyState icon={BarChart3} title="इस अवधि में कोई ट्रैफिक डेटा नहीं" />
              )}
            </Panel>
          )}

          {/* Sections 16/17 — hourly + day-of-week */}
          {traffic && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Panel title="समय के अनुसार ट्रैफिक (घंटा)">
                <LineChart
                  ariaLabel="घंटे के अनुसार ट्रैफिक"
                  data={traffic.byHourOfDay.map((p) => ({ label: `${p.hour}:00`, value: p.pageViews }))}
                  height={160}
                />
              </Panel>
              <Panel title="दिन के अनुसार ट्रैफिक">
                <BarList items={traffic.byDayOfWeek.map((p) => ({ label: p.dayLabel, value: p.pageViews }))} />
              </Panel>
            </div>
          )}

          {/* Section 7/8 — article analytics table */}
          <Panel
            title="खबर एनालिटिक्स"
            action={
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-600">
                  <input
                    type="checkbox"
                    checked={breakingOnly}
                    onChange={(e) => {
                      setArticlePageNum(1);
                      setBreakingOnly(e.target.checked);
                    }}
                  />
                  केवल ब्रेकिंग
                </label>
                <select
                  value={articleSort}
                  onChange={(e) => {
                    setArticlePageNum(1);
                    setArticleSort(e.target.value as ArticleAnalyticsSort);
                  }}
                  className="border border-ink-300 bg-white px-2 py-1.5 text-xs font-semibold text-ink-700 focus:border-brand-700 focus:outline-none"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <a
                  href={`/api/admin/analytics/export?exportType=articles&${exportQuery}`}
                  className="flex items-center gap-1 border border-ink-300 px-2.5 py-1.5 text-xs font-bold text-ink-700 hover:bg-ink-50"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden />
                  एक्सपोर्ट
                </a>
              </div>
            }
          >
            {articlesLoading && <LoadingBlock />}
            {!articlesLoading && (!articlesPage || articlesPage.items.length === 0) && (
              <EmptyState icon={Newspaper} title="इस अवधि में कोई डेटा नहीं" />
            )}
            {!articlesLoading && articlesPage && articlesPage.items.length > 0 && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-ink-200 text-xs font-bold tracking-wide text-ink-500 uppercase">
                        <th className="py-2 pr-3">खबर</th>
                        <th className="px-3 py-2">श्रेणी</th>
                        <th className="px-3 py-2 text-right">व्यूज़</th>
                        <th className="px-3 py-2 text-right">यूनिक विज़िटर्स</th>
                        <th className="px-3 py-2 text-right">औसत समय</th>
                        <th className="px-3 py-2 text-right">आज</th>
                        <th className="px-3 py-2 text-right">7 दिन</th>
                        <th className="px-3 py-2 text-right">30 दिन</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100">
                      {articlesPage.items.map((item) => (
                        <tr key={item.id} className="hover:bg-ink-50/60">
                          <td className="py-2.5 pr-3">
                            <Link href={`/admin/analytics/articles/${item.id}`} className="font-semibold text-ink-800 hover:text-brand-700">
                              {item.isBreaking && <Flame className="mr-1 inline h-3.5 w-3.5 text-brand-700" aria-hidden />}
                              {item.title}
                            </Link>
                          </td>
                          <td className="px-3 py-2.5 text-ink-500">{item.categoryName ?? "—"}</td>
                          <td className="px-3 py-2.5 text-right font-bold text-ink-800">{fmtNum(item.views)}</td>
                          <td className="px-3 py-2.5 text-right text-ink-600">{fmtNum(item.uniqueVisitors)}</td>
                          <td className="px-3 py-2.5 text-right text-ink-600">{item.avgTimeSeconds ? fmtDuration(item.avgTimeSeconds) : "—"}</td>
                          <td className="px-3 py-2.5 text-right text-ink-600">{fmtNum(item.viewsToday)}</td>
                          <td className="px-3 py-2.5 text-right text-ink-600">{fmtNum(item.views7d)}</td>
                          <td className="px-3 py-2.5 text-right text-ink-600">{fmtNum(item.views30d)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3 text-sm">
                  <button
                    type="button"
                    disabled={articlePageNum <= 1}
                    onClick={() => setArticlePageNum((p) => Math.max(1, p - 1))}
                    className="border border-ink-200 px-3 py-1.5 font-semibold text-ink-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    पिछला
                  </button>
                  <span className="text-ink-500">
                    पृष्ठ {articlesPage.page} / {Math.max(articlesPage.totalPages, 1)}
                  </span>
                  <button
                    type="button"
                    disabled={articlePageNum >= articlesPage.totalPages}
                    onClick={() => setArticlePageNum((p) => p + 1)}
                    className="border border-ink-200 px-3 py-1.5 font-semibold text-ink-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    अगला
                  </button>
                </div>
              </>
            )}
          </Panel>

          {/* Section 9 — categories */}
          <Panel
            title="श्रेणी एनालिटिक्स"
            action={
              <a
                href={`/api/admin/analytics/export?exportType=categories&${exportQuery}`}
                className="flex items-center gap-1 border border-ink-300 px-2.5 py-1.5 text-xs font-bold text-ink-700 hover:bg-ink-50"
              >
                <Download className="h-3.5 w-3.5" aria-hidden />
                एक्सपोर्ट
              </a>
            }
          >
            {categories && categories.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <BarList items={categories.map((c) => ({ label: c.name, value: c.views, pct: c.pctOfTotalViews }))} />
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-ink-200 text-xs font-bold tracking-wide text-ink-500 uppercase">
                        <th className="py-2 pr-3">श्रेणी</th>
                        <th className="px-3 py-2 text-right">खबरें</th>
                        <th className="px-3 py-2 text-right">व्यूज़/खबर</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100">
                      {categories.map((c) => (
                        <tr key={c.id}>
                          <td className="py-2 pr-3 font-semibold text-ink-800">{c.name}</td>
                          <td className="px-3 py-2 text-right text-ink-600">{fmtNum(c.articlesCount)}</td>
                          <td className="px-3 py-2 text-right text-ink-600">{c.avgViewsPerArticle.toLocaleString("hi-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyState icon={Newspaper} title="इस अवधि में कोई श्रेणी डेटा नहीं" />
            )}
          </Panel>

          {/* Section 10/11/12 — sources, devices, browsers, OS */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Panel
              title="ट्रैफिक स्रोत"
              action={
                <a
                  href={`/api/admin/analytics/export?exportType=sources&${exportQuery}`}
                  className="flex items-center gap-1 border border-ink-300 px-2.5 py-1.5 text-xs font-bold text-ink-700 hover:bg-ink-50"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden />
                  एक्सपोर्ट
                </a>
              }
            >
              {sources && sources.sources.some((s) => s.pageViews > 0) ? (
                <>
                  <BarList
                    items={sources.sources.map((s) => ({ label: SOURCE_LABELS[s.source] ?? s.source, value: s.pageViews, pct: s.pct }))}
                  />
                  {sources.topReferringDomains.length > 0 && (
                    <div className="mt-5 border-t border-ink-100 pt-4">
                      <p className="mb-2 text-xs font-bold tracking-wide text-ink-500 uppercase">टॉप रेफरिंग डोमेन</p>
                      <ul className="space-y-1.5 text-sm">
                        {sources.topReferringDomains.slice(0, 8).map((d) => (
                          <li key={d.domain} className="flex items-center justify-between">
                            <span className="truncate text-ink-700">{d.domain}</span>
                            <span className="font-bold text-ink-500">{fmtNum(d.visits)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState icon={BarChart3} title="इस अवधि में कोई ट्रैफिक स्रोत डेटा नहीं" />
              )}
            </Panel>

            <Panel title="डिवाइस, ब्राउज़र और OS">
              {devices && (devices.devices.length > 0 || devices.browsers.length > 0) ? (
                <div className="space-y-5">
                  {devices.devices.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-bold tracking-wide text-ink-500 uppercase">डिवाइस</p>
                      <BarList items={devices.devices.map((d) => ({ label: d.label, value: d.count, pct: d.pct }))} />
                    </div>
                  )}
                  {devices.browsers.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-bold tracking-wide text-ink-500 uppercase">ब्राउज़र</p>
                      <BarList items={devices.browsers.map((d) => ({ label: d.label, value: d.count, pct: d.pct }))} />
                    </div>
                  )}
                  {devices.operatingSystems.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-bold tracking-wide text-ink-500 uppercase">ऑपरेटिंग सिस्टम</p>
                      <BarList items={devices.operatingSystems.map((d) => ({ label: d.label, value: d.count, pct: d.pct }))} />
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState icon={BarChart3} title="इस अवधि में कोई डिवाइस डेटा नहीं" />
              )}
            </Panel>
          </div>

          {/* Section 20 — search analytics */}
          <Panel title="खोज से जुड़ी जानकारी">
            {searchAnalytics && searchAnalytics.totalSearches > 0 ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <p className="text-xs font-bold tracking-wide text-ink-500 uppercase">कुल खोजें</p>
                  <p className="font-serif-hi mt-1 text-2xl font-extrabold text-ink-900">{fmtNum(searchAnalytics.totalSearches)}</p>

                  {searchAnalytics.topTerms.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-bold tracking-wide text-ink-500 uppercase">सबसे ज़्यादा खोजे गए शब्द</p>
                      <ul className="space-y-1.5 text-sm">
                        {searchAnalytics.topTerms.slice(0, 10).map((t) => (
                          <li key={t.query} className="flex items-center justify-between">
                            <span className="truncate text-ink-700">{t.query}</span>
                            <span className="font-bold text-ink-500">{fmtNum(t.count)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {searchAnalytics.zeroResultTerms.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-bold tracking-wide text-ink-500 uppercase">बिना परिणाम वाली खोजें</p>
                    <ul className="space-y-1.5 text-sm">
                      {searchAnalytics.zeroResultTerms.slice(0, 10).map((t) => (
                        <li key={t.query} className="flex items-center justify-between">
                          <span className="truncate text-ink-700">{t.query}</span>
                          <span className="font-bold text-brand-700">{fmtNum(t.count)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState icon={SearchIcon} title="इस अवधि में कोई खोज दर्ज नहीं हुई" />
            )}
          </Panel>

          {/* Section 22 — publishing performance */}
          <Panel title="प्रकाशन प्रदर्शन">
            {publishing && (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="प्रकाशित" value={fmtNum(publishing.counts.published)} icon={FileText} />
                  <StatCard label="ड्राफ्ट" value={fmtNum(publishing.counts.draft)} icon={FileText} />
                  <StatCard label="आर्काइव्ड" value={fmtNum(publishing.counts.archived)} icon={FileText} />
                </div>

                {publishing.bestPublishSlots.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-bold tracking-wide text-ink-500 uppercase">
                      सबसे बेहतर प्रकाशन समय (औसत व्यूज़ अनुसार)
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-ink-200 text-xs font-bold tracking-wide text-ink-500 uppercase">
                            <th className="py-2 pr-3">दिन</th>
                            <th className="px-3 py-2">समय</th>
                            <th className="px-3 py-2 text-right">औसत व्यूज़</th>
                            <th className="px-3 py-2 text-right">नमूना</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink-100">
                          {publishing.bestPublishSlots.slice(0, 8).map((slot, i) => (
                            <tr key={i}>
                              <td className="py-2 pr-3 font-semibold text-ink-800">{slot.dayLabel}</td>
                              <td className="px-3 py-2 text-ink-600">{slot.hour}:00</td>
                              <td className="px-3 py-2 text-right text-ink-600">{slot.avgViews.toLocaleString("hi-IN")}</td>
                              <td className="px-3 py-2 text-right text-ink-400">{slot.sampleSize}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Panel>
        </>
      )}

      {/* Section 14/15 — realtime, independent of the date range */}
      <Panel
        title="अभी साइट पर"
        action={
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <Radio className="h-3.5 w-3.5 animate-pulse" aria-hidden />
            लाइव
          </span>
        }
      >
        {realtime ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div>
              <p className="text-xs font-bold tracking-wide text-ink-500 uppercase">अभी सक्रिय विज़िटर्स</p>
              <p className="font-serif-hi mt-1 text-4xl font-extrabold text-brand-700">{fmtNum(realtime.activeNow)}</p>
              <p className="mt-1 text-xs text-ink-400">पिछले {realtime.windowMinutes} मिनट में</p>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold tracking-wide text-ink-500 uppercase">हाल की गतिविधि</p>
              {realtime.recentActivity.length > 0 ? (
                <ul className="max-h-56 space-y-1.5 overflow-y-auto text-sm">
                  {realtime.recentActivity.slice(0, 12).map((a, i) => (
                    <li key={i} className="flex items-center justify-between gap-2">
                      <span className="truncate text-ink-700">{a.title}</span>
                      <span className="shrink-0 text-xs text-ink-400">{formatRelativeHindi(a.occurredAt)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-400">अभी कोई गतिविधि नहीं</p>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs font-bold tracking-wide text-ink-500 uppercase">अभी सबसे ज्यादा देखी जा रही खबरें</p>
              {realtime.topContent.length > 0 ? (
                <ul className="space-y-1.5 text-sm">
                  {realtime.topContent.map((item) => (
                    <li key={item.id}>
                      <Link href={`/admin/analytics/articles/${item.id}`} className={cn("truncate text-ink-700 hover:text-brand-700")}>
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-400">अभी पर्याप्त डेटा नहीं</p>
              )}
            </div>
          </div>
        ) : (
          <LoadingBlock />
        )}
      </Panel>
    </div>
  );
}

const SOURCE_LABELS: Record<string, string> = {
  direct: "डायरेक्ट",
  search: "सर्च",
  social: "सोशल",
  referral: "रेफरल",
  other: "अन्य",
};
