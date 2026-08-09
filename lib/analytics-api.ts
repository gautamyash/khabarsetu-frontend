import { apiClient } from "@/lib/api-client";
import { toApiError } from "@/lib/api-error";
import type { Page } from "@/types/pagination";
import type {
  AnalyticsDevices,
  AnalyticsExportType,
  AnalyticsOverview,
  AnalyticsPublishing,
  AnalyticsRealtime,
  AnalyticsSearch,
  AnalyticsSources,
  AnalyticsTraffic,
  ArticleAnalyticsDetail,
  ArticleAnalyticsListItem,
  ArticleAnalyticsSort,
  BreakdownItem,
  CategoryAnalyticsItem,
  ComparisonMetric,
  DateRangeParams,
  DayOfWeekPoint,
  HourOfDayPoint,
  PeriodComparison,
  PublishingPeriodItem,
  PublishingTimeSlot,
  RealtimeActivityItem,
  ReferringDomainItem,
  SearchTermItem,
  SourceAnalyticsItem,
  TrafficGranularity,
  TrafficMetric,
  TrafficPoint,
  TrendingArticleItem,
} from "@/types/analytics";

/**
 * Server-only wrappers around the backend's /analytics/* endpoints — same
 * token-authenticated pattern as lib/articles-api.ts. Every function here
 * requires an ADMIN token (the backend enforces this with require_admin;
 * this module doesn't re-check the role, it just relays whatever the
 * backend decides — a non-admin token gets a 403 that bubbles up as an
 * ApiError, same as any other admin endpoint).
 */

function toDateRangeQuery(range: DateRangeParams): Record<string, string | undefined> {
  return {
    preset: range.preset ?? "last_30_days",
    start_date: range.startDate,
    end_date: range.endDate,
  };
}

/** Shared by every app/api/admin/analytics/* Route Handler — reads the
 * (camelCase) date-range query params the dashboard sends. */
export function parseDateRangeParams(searchParams: URLSearchParams): DateRangeParams {
  return {
    preset: (searchParams.get("preset") as DateRangeParams["preset"]) ?? undefined,
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
  };
}

// ---- shape <-> mapper pairs, in the same order as types/analytics.ts ----

interface BreakdownItemApiShape {
  label: string;
  count: number;
  pct: number;
}
function mapBreakdown(raw: BreakdownItemApiShape): BreakdownItem {
  return { label: raw.label, count: raw.count, pct: raw.pct };
}

interface TrafficPointApiShape {
  bucket: string;
  visitors: number;
  unique_visitors: number;
  page_views: number;
  sessions: number;
}
function mapTrafficPoint(raw: TrafficPointApiShape): TrafficPoint {
  return { bucket: raw.bucket, visitors: raw.visitors, uniqueVisitors: raw.unique_visitors, pageViews: raw.page_views, sessions: raw.sessions };
}

interface HourOfDayPointApiShape {
  hour: number;
  visitors: number;
  page_views: number;
  sessions: number;
}
function mapHourOfDay(raw: HourOfDayPointApiShape): HourOfDayPoint {
  return { hour: raw.hour, visitors: raw.visitors, pageViews: raw.page_views, sessions: raw.sessions };
}

interface DayOfWeekPointApiShape {
  day_index: number;
  day_label: string;
  visitors: number;
  page_views: number;
  sessions: number;
}
function mapDayOfWeek(raw: DayOfWeekPointApiShape): DayOfWeekPoint {
  return { dayIndex: raw.day_index, dayLabel: raw.day_label, visitors: raw.visitors, pageViews: raw.page_views, sessions: raw.sessions };
}

interface ArticleRefApiShape {
  id: string;
  title: string;
  slug: string;
  views: number;
}
interface TrendingArticleApiShape extends ArticleRefApiShape {
  velocity_pct: number;
}
function mapTrending(raw: TrendingArticleApiShape): TrendingArticleItem {
  return { id: raw.id, title: raw.title, slug: raw.slug, views: raw.views, velocityPct: raw.velocity_pct };
}

interface ComparisonMetricApiShape {
  current: number;
  previous: number | null;
  change_pct: number | null;
}
function mapComparison(raw: ComparisonMetricApiShape): ComparisonMetric {
  return { current: raw.current, previous: raw.previous, changePct: raw.change_pct };
}

interface PeriodComparisonApiShape {
  visitors: ComparisonMetricApiShape;
  page_views: ComparisonMetricApiShape;
}
function mapPeriodComparison(raw: PeriodComparisonApiShape): PeriodComparison {
  return { visitors: mapComparison(raw.visitors), pageViews: mapComparison(raw.page_views) };
}

interface AnalyticsOverviewApiShape {
  total_visits: number;
  unique_visitors: number;
  total_page_views: number;
  today_visitors: number;
  today_page_views: number;
  month_visitors: number;
  month_page_views: number;
  year_visitors: number;
  year_page_views: number;
  avg_session_duration_seconds: number | null;
  bounce_rate: number | null;
  published_articles_count: number;
  most_viewed_article: ArticleRefApiShape | null;
  top_category: { id: string; name: string; slug: string; views: number } | null;
  today_vs_yesterday: PeriodComparisonApiShape;
  month_vs_last_month: PeriodComparisonApiShape;
  year_vs_last_year: PeriodComparisonApiShape;
  trending: TrendingArticleApiShape[];
}

export async function getAnalyticsOverview(token: string): Promise<AnalyticsOverview> {
  try {
    const { data } = await apiClient.get<AnalyticsOverviewApiShape>("/analytics/overview", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      totalVisits: data.total_visits,
      uniqueVisitors: data.unique_visitors,
      totalPageViews: data.total_page_views,
      todayVisitors: data.today_visitors,
      todayPageViews: data.today_page_views,
      monthVisitors: data.month_visitors,
      monthPageViews: data.month_page_views,
      yearVisitors: data.year_visitors,
      yearPageViews: data.year_page_views,
      avgSessionDurationSeconds: data.avg_session_duration_seconds,
      bounceRate: data.bounce_rate,
      publishedArticlesCount: data.published_articles_count,
      mostViewedArticle: data.most_viewed_article,
      topCategory: data.top_category,
      todayVsYesterday: mapPeriodComparison(data.today_vs_yesterday),
      monthVsLastMonth: mapPeriodComparison(data.month_vs_last_month),
      yearVsLastYear: mapPeriodComparison(data.year_vs_last_year),
      trending: data.trending.map(mapTrending),
    };
  } catch (error) {
    throw toApiError(error, "एनालिटिक्स लोड नहीं हो सकी।");
  }
}

interface AnalyticsTrafficApiShape {
  metric: TrafficMetric;
  granularity: TrafficGranularity;
  start_date: string;
  end_date: string;
  points: TrafficPointApiShape[];
  by_hour_of_day: HourOfDayPointApiShape[];
  by_day_of_week: DayOfWeekPointApiShape[];
}

export async function getAnalyticsTraffic(
  token: string,
  params: DateRangeParams & { metric?: TrafficMetric; granularity?: TrafficGranularity }
): Promise<AnalyticsTraffic> {
  try {
    const { data } = await apiClient.get<AnalyticsTrafficApiShape>("/analytics/traffic", {
      headers: { Authorization: `Bearer ${token}` },
      params: { ...toDateRangeQuery(params), metric: params.metric, granularity: params.granularity },
    });
    return {
      metric: data.metric,
      granularity: data.granularity,
      startDate: data.start_date,
      endDate: data.end_date,
      points: data.points.map(mapTrafficPoint),
      byHourOfDay: data.by_hour_of_day.map(mapHourOfDay),
      byDayOfWeek: data.by_day_of_week.map(mapDayOfWeek),
    };
  } catch (error) {
    throw toApiError(error, "ट्रैफिक डेटा लोड नहीं हो सका।");
  }
}

interface ArticleAnalyticsListItemApiShape {
  id: string;
  title: string;
  slug: string;
  category_name: string | null;
  category_slug: string | null;
  published_at: string | null;
  views: number;
  unique_visitors: number;
  sessions: number;
  avg_time_seconds: number | null;
  views_today: number;
  views_7d: number;
  views_30d: number;
  is_breaking: boolean;
  first_hour_views: number | null;
  first_24h_views: number | null;
  peak_hour_views: number | null;
}
function mapArticleListItem(raw: ArticleAnalyticsListItemApiShape): ArticleAnalyticsListItem {
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    categoryName: raw.category_name,
    categorySlug: raw.category_slug,
    publishedAt: raw.published_at,
    views: raw.views,
    uniqueVisitors: raw.unique_visitors,
    sessions: raw.sessions,
    avgTimeSeconds: raw.avg_time_seconds,
    viewsToday: raw.views_today,
    views7d: raw.views_7d,
    views30d: raw.views_30d,
    isBreaking: raw.is_breaking,
    firstHourViews: raw.first_hour_views,
    first24hViews: raw.first_24h_views,
    peakHourViews: raw.peak_hour_views,
  };
}

interface PageApiShape<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export async function getArticleAnalyticsList(
  token: string,
  params: DateRangeParams & { page?: number; limit?: number; sort?: ArticleAnalyticsSort; breakingOnly?: boolean }
): Promise<Page<ArticleAnalyticsListItem>> {
  try {
    const { data } = await apiClient.get<PageApiShape<ArticleAnalyticsListItemApiShape>>("/analytics/articles", {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        ...toDateRangeQuery(params),
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        sort: params.sort ?? "views",
        breaking_only: params.breakingOnly ?? undefined,
      },
    });
    return {
      items: data.items.map(mapArticleListItem),
      page: data.page,
      limit: data.limit,
      total: data.total,
      totalPages: data.total_pages,
    };
  } catch (error) {
    throw toApiError(error, "खबरों की एनालिटिक्स लोड नहीं हो सकी।");
  }
}

interface ArticleAnalyticsDetailApiShape {
  id: string;
  title: string;
  slug: string;
  category_name: string | null;
  category_slug: string | null;
  published_at: string | null;
  total_views: number;
  unique_visitors: number;
  sessions: number;
  avg_time_seconds: number | null;
  views_today: number;
  views_7d: number;
  views_30d: number;
  views_month: number;
  views_year: number;
  trend: TrafficPointApiShape[];
  hourly_distribution: HourOfDayPointApiShape[];
  peak_hour: HourOfDayPointApiShape | null;
  top_referrers: BreakdownItemApiShape[];
  devices: BreakdownItemApiShape[];
  browsers: BreakdownItemApiShape[];
  operating_systems: BreakdownItemApiShape[];
  countries: BreakdownItemApiShape[];
}

export async function getArticleAnalyticsDetail(token: string, articleId: string): Promise<ArticleAnalyticsDetail | null> {
  try {
    const { data } = await apiClient.get<ArticleAnalyticsDetailApiShape>(`/analytics/articles/${articleId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      categoryName: data.category_name,
      categorySlug: data.category_slug,
      publishedAt: data.published_at,
      totalViews: data.total_views,
      uniqueVisitors: data.unique_visitors,
      sessions: data.sessions,
      avgTimeSeconds: data.avg_time_seconds,
      viewsToday: data.views_today,
      views7d: data.views_7d,
      views30d: data.views_30d,
      viewsMonth: data.views_month,
      viewsYear: data.views_year,
      trend: data.trend.map(mapTrafficPoint),
      hourlyDistribution: data.hourly_distribution.map(mapHourOfDay),
      peakHour: data.peak_hour ? mapHourOfDay(data.peak_hour) : null,
      topReferrers: data.top_referrers.map(mapBreakdown),
      devices: data.devices.map(mapBreakdown),
      browsers: data.browsers.map(mapBreakdown),
      operatingSystems: data.operating_systems.map(mapBreakdown),
      countries: data.countries.map(mapBreakdown),
    };
  } catch (error) {
    const apiError = toApiError(error, "खबर की एनालिटिक्स लोड नहीं हो सकी।");
    if (apiError.status === 404) return null;
    throw apiError;
  }
}

interface CategoryAnalyticsItemApiShape {
  id: string;
  name: string;
  slug: string;
  articles_count: number;
  views: number;
  unique_visitors: number;
  avg_views_per_article: number;
  pct_of_total_views: number;
}

export async function getCategoryAnalytics(token: string, params: DateRangeParams): Promise<CategoryAnalyticsItem[]> {
  try {
    const { data } = await apiClient.get<CategoryAnalyticsItemApiShape[]>("/analytics/categories", {
      headers: { Authorization: `Bearer ${token}` },
      params: toDateRangeQuery(params),
    });
    return data.map((raw) => ({
      id: raw.id,
      name: raw.name,
      slug: raw.slug,
      articlesCount: raw.articles_count,
      views: raw.views,
      uniqueVisitors: raw.unique_visitors,
      avgViewsPerArticle: raw.avg_views_per_article,
      pctOfTotalViews: raw.pct_of_total_views,
    }));
  } catch (error) {
    throw toApiError(error, "श्रेणी एनालिटिक्स लोड नहीं हो सकी।");
  }
}

interface SourceAnalyticsItemApiShape {
  source: string;
  visitors: number;
  sessions: number;
  page_views: number;
  pct: number;
}
interface AnalyticsSourcesApiShape {
  sources: SourceAnalyticsItemApiShape[];
  top_referring_domains: ReferringDomainItem[];
}

export async function getAnalyticsSources(token: string, params: DateRangeParams): Promise<AnalyticsSources> {
  try {
    const { data } = await apiClient.get<AnalyticsSourcesApiShape>("/analytics/sources", {
      headers: { Authorization: `Bearer ${token}` },
      params: toDateRangeQuery(params),
    });
    const sources: SourceAnalyticsItem[] = data.sources.map((raw) => ({
      source: raw.source,
      visitors: raw.visitors,
      sessions: raw.sessions,
      pageViews: raw.page_views,
      pct: raw.pct,
    }));
    return { sources, topReferringDomains: data.top_referring_domains };
  } catch (error) {
    throw toApiError(error, "ट्रैफिक स्रोत लोड नहीं हो सके।");
  }
}

interface AnalyticsDevicesApiShape {
  devices: BreakdownItemApiShape[];
  browsers: BreakdownItemApiShape[];
  operating_systems: BreakdownItemApiShape[];
}

export async function getAnalyticsDevices(token: string, params: DateRangeParams): Promise<AnalyticsDevices> {
  try {
    const { data } = await apiClient.get<AnalyticsDevicesApiShape>("/analytics/devices", {
      headers: { Authorization: `Bearer ${token}` },
      params: toDateRangeQuery(params),
    });
    return {
      devices: data.devices.map(mapBreakdown),
      browsers: data.browsers.map(mapBreakdown),
      operatingSystems: data.operating_systems.map(mapBreakdown),
    };
  } catch (error) {
    throw toApiError(error, "डिवाइस एनालिटिक्स लोड नहीं हो सकी।");
  }
}

interface RealtimeActivityApiShape {
  content_type: string;
  title: string;
  slug: string;
  occurred_at: string;
}
interface AnalyticsRealtimeApiShape {
  active_now: number;
  window_minutes: number;
  recent_activity: RealtimeActivityApiShape[];
  top_content: ArticleRefApiShape[];
}

export async function getAnalyticsRealtime(token: string): Promise<AnalyticsRealtime> {
  try {
    const { data } = await apiClient.get<AnalyticsRealtimeApiShape>("/analytics/realtime", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const recentActivity: RealtimeActivityItem[] = data.recent_activity.map((raw) => ({
      contentType: raw.content_type,
      title: raw.title,
      slug: raw.slug,
      occurredAt: raw.occurred_at,
    }));
    return { activeNow: data.active_now, windowMinutes: data.window_minutes, recentActivity, topContent: data.top_content };
  } catch (error) {
    throw toApiError(error, "रीयल-टाइम डेटा लोड नहीं हो सका।");
  }
}

interface AnalyticsSearchApiShape {
  total_searches: number;
  searches_over_time: TrafficPointApiShape[];
  top_terms: SearchTermItem[];
  zero_result_terms: SearchTermItem[];
}

export async function getAnalyticsSearch(token: string, params: DateRangeParams): Promise<AnalyticsSearch> {
  try {
    const { data } = await apiClient.get<AnalyticsSearchApiShape>("/analytics/search", {
      headers: { Authorization: `Bearer ${token}` },
      params: toDateRangeQuery(params),
    });
    return {
      totalSearches: data.total_searches,
      searchesOverTime: data.searches_over_time.map(mapTrafficPoint),
      topTerms: data.top_terms,
      zeroResultTerms: data.zero_result_terms,
    };
  } catch (error) {
    throw toApiError(error, "खोज एनालिटिक्स लोड नहीं हो सकी।");
  }
}

interface AnalyticsPublishingApiShape {
  counts: { published: number; draft: number; archived: number };
  by_day: PublishingPeriodItem[];
  by_week: PublishingPeriodItem[];
  by_month: PublishingPeriodItem[];
  best_publish_slots: { day_label: string; hour: number; avg_views: number; sample_size: number }[];
}

export async function getAnalyticsPublishing(token: string, params: DateRangeParams): Promise<AnalyticsPublishing> {
  try {
    const { data } = await apiClient.get<AnalyticsPublishingApiShape>("/analytics/publishing", {
      headers: { Authorization: `Bearer ${token}` },
      params: toDateRangeQuery(params),
    });
    const bestPublishSlots: PublishingTimeSlot[] = data.best_publish_slots.map((raw) => ({
      dayLabel: raw.day_label,
      hour: raw.hour,
      avgViews: raw.avg_views,
      sampleSize: raw.sample_size,
    }));
    return { counts: data.counts, byDay: data.by_day, byWeek: data.by_week, byMonth: data.by_month, bestPublishSlots };
  } catch (error) {
    throw toApiError(error, "प्रकाशन प्रदर्शन लोड नहीं हो सका।");
  }
}

/** Returns the raw CSV text plus the filename the backend suggested — the
 * Route Handler streams this straight back to the browser as a download.
 * Never includes a visitor_id column (see backend export_csv docstring). */
export async function exportAnalyticsCsv(
  token: string,
  exportType: AnalyticsExportType,
  params: DateRangeParams
): Promise<{ csv: string; filename: string }> {
  try {
    const response = await apiClient.get<string>("/analytics/export", {
      headers: { Authorization: `Bearer ${token}` },
      params: { ...toDateRangeQuery(params), export_type: exportType },
      responseType: "text",
    });
    const disposition = String(response.headers["content-disposition"] ?? "");
    const match = /filename="([^"]+)"/.exec(disposition);
    const filename = match?.[1] ?? `analytics-${exportType}.csv`;
    return { csv: response.data, filename };
  } catch (error) {
    throw toApiError(error, "एक्सपोर्ट नहीं हो सका।");
  }
}
