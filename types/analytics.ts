/** Mirrors backend/app/schemas/analytics.py. Every shape here is what the
 * admin analytics dashboard renders — camelCase, mapped from the backend's
 * snake_case JSON by lib/analytics-api.ts. */

export type DateRangePreset =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "last_90_days"
  | "this_month"
  | "last_month"
  | "this_year"
  | "custom";

export type TrafficMetric = "visitors" | "unique_visitors" | "page_views" | "sessions";
export type TrafficGranularity = "hourly" | "daily" | "monthly";
export type ArticleAnalyticsSort = "views" | "unique_visitors" | "trending" | "recent";
export type AnalyticsExportType = "articles" | "traffic" | "sources" | "categories";

export interface DateRangeParams {
  preset?: DateRangePreset;
  startDate?: string;
  endDate?: string;
}

export interface BreakdownItem {
  label: string;
  count: number;
  pct: number;
}

export interface TrafficPoint {
  bucket: string;
  visitors: number;
  uniqueVisitors: number;
  pageViews: number;
  sessions: number;
}

export interface HourOfDayPoint {
  hour: number;
  visitors: number;
  pageViews: number;
  sessions: number;
}

export interface DayOfWeekPoint {
  dayIndex: number;
  dayLabel: string;
  visitors: number;
  pageViews: number;
  sessions: number;
}

export interface ArticleRefWithViews {
  id: string;
  title: string;
  slug: string;
  views: number;
}

export interface TrendingArticleItem extends ArticleRefWithViews {
  velocityPct: number;
}

export interface CategoryRefWithViews {
  id: string;
  name: string;
  slug: string;
  views: number;
}

export interface ComparisonMetric {
  current: number;
  previous: number | null;
  changePct: number | null;
}

export interface PeriodComparison {
  visitors: ComparisonMetric;
  pageViews: ComparisonMetric;
}

export interface AnalyticsOverview {
  totalVisits: number;
  uniqueVisitors: number;
  totalPageViews: number;
  todayVisitors: number;
  todayPageViews: number;
  monthVisitors: number;
  monthPageViews: number;
  yearVisitors: number;
  yearPageViews: number;
  avgSessionDurationSeconds: number | null;
  bounceRate: number | null;
  publishedArticlesCount: number;
  mostViewedArticle: ArticleRefWithViews | null;
  topCategory: CategoryRefWithViews | null;
  todayVsYesterday: PeriodComparison;
  monthVsLastMonth: PeriodComparison;
  yearVsLastYear: PeriodComparison;
  trending: TrendingArticleItem[];
}

export interface AnalyticsTraffic {
  metric: TrafficMetric;
  granularity: TrafficGranularity;
  startDate: string;
  endDate: string;
  points: TrafficPoint[];
  byHourOfDay: HourOfDayPoint[];
  byDayOfWeek: DayOfWeekPoint[];
}

export interface ArticleAnalyticsListItem {
  id: string;
  title: string;
  slug: string;
  categoryName: string | null;
  categorySlug: string | null;
  publishedAt: string | null;
  views: number;
  uniqueVisitors: number;
  sessions: number;
  avgTimeSeconds: number | null;
  viewsToday: number;
  views7d: number;
  views30d: number;
  isBreaking: boolean;
  firstHourViews: number | null;
  first24hViews: number | null;
  peakHourViews: number | null;
}

export interface ArticleAnalyticsDetail {
  id: string;
  title: string;
  slug: string;
  categoryName: string | null;
  categorySlug: string | null;
  publishedAt: string | null;
  totalViews: number;
  uniqueVisitors: number;
  sessions: number;
  avgTimeSeconds: number | null;
  viewsToday: number;
  views7d: number;
  views30d: number;
  viewsMonth: number;
  viewsYear: number;
  trend: TrafficPoint[];
  hourlyDistribution: HourOfDayPoint[];
  peakHour: HourOfDayPoint | null;
  topReferrers: BreakdownItem[];
  devices: BreakdownItem[];
  browsers: BreakdownItem[];
  operatingSystems: BreakdownItem[];
  countries: BreakdownItem[];
}

export interface CategoryAnalyticsItem {
  id: string;
  name: string;
  slug: string;
  articlesCount: number;
  views: number;
  uniqueVisitors: number;
  avgViewsPerArticle: number;
  pctOfTotalViews: number;
}

export interface SourceAnalyticsItem {
  source: string;
  visitors: number;
  sessions: number;
  pageViews: number;
  pct: number;
}

export interface ReferringDomainItem {
  domain: string;
  visits: number;
}

export interface AnalyticsSources {
  sources: SourceAnalyticsItem[];
  topReferringDomains: ReferringDomainItem[];
}

export interface AnalyticsDevices {
  devices: BreakdownItem[];
  browsers: BreakdownItem[];
  operatingSystems: BreakdownItem[];
}

export interface RealtimeActivityItem {
  contentType: string;
  title: string;
  slug: string;
  occurredAt: string;
}

export interface AnalyticsRealtime {
  activeNow: number;
  windowMinutes: number;
  recentActivity: RealtimeActivityItem[];
  topContent: ArticleRefWithViews[];
}

export interface SearchTermItem {
  query: string;
  count: number;
}

export interface AnalyticsSearch {
  totalSearches: number;
  searchesOverTime: TrafficPoint[];
  topTerms: SearchTermItem[];
  zeroResultTerms: SearchTermItem[];
}

export interface PublishingStatusCounts {
  published: number;
  draft: number;
  archived: number;
}

export interface PublishingPeriodItem {
  bucket: string;
  count: number;
}

export interface PublishingTimeSlot {
  dayLabel: string;
  hour: number;
  avgViews: number;
  sampleSize: number;
}

export interface AnalyticsPublishing {
  counts: PublishingStatusCounts;
  byDay: PublishingPeriodItem[];
  byWeek: PublishingPeriodItem[];
  byMonth: PublishingPeriodItem[];
  bestPublishSlots: PublishingTimeSlot[];
}
