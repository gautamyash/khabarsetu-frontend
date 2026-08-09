import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, Clock, Eye, Flame, Users } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/analytics/StatCard";
import { LineChart } from "@/components/analytics/LineChart";
import { BarList } from "@/components/analytics/BarList";
import { getArticleAnalyticsDetail } from "@/lib/analytics-api";
import { getSessionToken } from "@/lib/session";
import { formatHindiDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "खबर एनालिटिक्स",
};

function fmtNum(n: number): string {
  return n.toLocaleString("hi-IN");
}

function fmtDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")} मिनट`;
}

const SOURCE_LABELS: Record<string, string> = {
  desktop: "डेस्कटॉप",
  mobile: "मोबाइल",
  tablet: "टैबलेट",
};

/**
 * Per-article analytics detail (spec section 7). A Server Component that
 * calls lib/analytics-api.ts directly with the session token — same
 * pattern as app/admin/(dashboard)/news/[id]/edit/page.tsx — rather than
 * going through the app/api/admin/analytics/articles/[id] proxy, since
 * this page has no client-side interactivity of its own (no date-range
 * picker here; every window shown is a fixed today/7d/30d/month/year plus
 * a 30-day trend, all computed server-side already).
 */
export default async function ArticleAnalyticsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getSessionToken();

  if (!token) {
    return (
      <EmptyState icon={Eye} size="lg" title="प्रमाणीकरण आवश्यक है" message="कृपया पुनः लॉगिन करें।" />
    );
  }

  const detail = await getArticleAnalyticsDetail(token, id).catch(() => null);

  if (!detail) {
    return <EmptyState icon={Eye} size="lg" title="एनालिटिक्स डेटा नहीं मिला" message="यह खबर मौजूद नहीं है या अभी तक कोई डेटा दर्ज नहीं हुआ।" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/analytics" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-500 hover:text-brand-700">
          <ChevronLeft className="h-4 w-4" aria-hidden />
          एनालिटिक्स पर वापस जाएं
        </Link>
        <h1 className="font-serif-hi mt-2 text-2xl font-extrabold text-ink-900">{detail.title}</h1>
        <p className="mt-1 text-sm text-ink-500">
          {detail.categoryName ?? "—"}
          {detail.publishedAt && (
            <>
              <span className="mx-1.5 text-ink-300">·</span>
              प्रकाशित: {formatHindiDate(detail.publishedAt)}
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="कुल व्यूज़" value={fmtNum(detail.totalViews)} icon={Eye} highlight />
        <StatCard label="यूनिक विज़िटर्स" value={fmtNum(detail.uniqueVisitors)} icon={Users} />
        <StatCard label="सेशन" value={fmtNum(detail.sessions)} icon={Users} />
        <StatCard label="औसत समय" value={fmtDuration(detail.avgTimeSeconds)} icon={Clock} />
        <StatCard label="आज" value={fmtNum(detail.viewsToday)} icon={Eye} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="7 दिन" value={fmtNum(detail.views7d)} icon={Eye} />
        <StatCard label="30 दिन" value={fmtNum(detail.views30d)} icon={Eye} />
        <StatCard label="इस महीने" value={fmtNum(detail.viewsMonth)} icon={Eye} />
        <StatCard label="इस साल" value={fmtNum(detail.viewsYear)} icon={Eye} />
      </div>

      <section className="border border-ink-200 bg-white p-5">
        <h2 className="font-serif-hi mb-4 text-lg font-bold text-ink-900">पिछले 30 दिनों का ट्रेंड</h2>
        {detail.trend.some((p) => p.pageViews > 0) ? (
          <LineChart ariaLabel="पिछले 30 दिनों का ट्रैफिक ट्रेंड" data={detail.trend.map((p) => ({ label: p.bucket, value: p.pageViews }))} />
        ) : (
          <EmptyState icon={Eye} title="इस अवधि में कोई ट्रैफिक डेटा नहीं" />
        )}
      </section>

      <section className="border border-ink-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif-hi text-lg font-bold text-ink-900">यह खबर कब सबसे ज्यादा पढ़ी गई</h2>
          {detail.peakHour && (
            <span className="flex items-center gap-1.5 text-sm font-bold text-brand-700">
              <Flame className="h-4 w-4" aria-hidden />
              {detail.peakHour.hour}:00 – {(detail.peakHour.hour + 1) % 24}:00
            </span>
          )}
        </div>
        {detail.hourlyDistribution.some((p) => p.pageViews > 0) ? (
          <LineChart
            ariaLabel="दिन के घंटे के अनुसार पढ़ाई गई"
            data={detail.hourlyDistribution.map((p) => ({ label: `${p.hour}:00`, value: p.pageViews }))}
            height={160}
          />
        ) : (
          <EmptyState icon={Clock} title="अभी पर्याप्त डेटा नहीं" />
        )}
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="border border-ink-200 bg-white p-5">
          <h2 className="font-serif-hi mb-4 text-lg font-bold text-ink-900">टॉप रेफरर</h2>
          {detail.topReferrers.length > 0 ? (
            <BarList items={detail.topReferrers.map((r) => ({ label: r.label, value: r.count, pct: r.pct }))} />
          ) : (
            <EmptyState icon={Eye} title="कोई रेफरर डेटा नहीं" />
          )}
        </section>

        <section className="border border-ink-200 bg-white p-5">
          <h2 className="font-serif-hi mb-4 text-lg font-bold text-ink-900">डिवाइस</h2>
          {detail.devices.length > 0 ? (
            <BarList items={detail.devices.map((d) => ({ label: SOURCE_LABELS[d.label] ?? d.label, value: d.count, pct: d.pct }))} />
          ) : (
            <EmptyState icon={Eye} title="कोई डिवाइस डेटा नहीं" />
          )}
        </section>

        <section className="border border-ink-200 bg-white p-5">
          <h2 className="font-serif-hi mb-4 text-lg font-bold text-ink-900">ब्राउज़र</h2>
          {detail.browsers.length > 0 ? (
            <BarList items={detail.browsers.map((b) => ({ label: b.label, value: b.count, pct: b.pct }))} />
          ) : (
            <EmptyState icon={Eye} title="कोई ब्राउज़र डेटा नहीं" />
          )}
        </section>

        <section className="border border-ink-200 bg-white p-5">
          <h2 className="font-serif-hi mb-4 text-lg font-bold text-ink-900">ऑपरेटिंग सिस्टम</h2>
          {detail.operatingSystems.length > 0 ? (
            <BarList items={detail.operatingSystems.map((o) => ({ label: o.label, value: o.count, pct: o.pct }))} />
          ) : (
            <EmptyState icon={Eye} title="कोई OS डेटा नहीं" />
          )}
        </section>
      </div>
    </div>
  );
}
