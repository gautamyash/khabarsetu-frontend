import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export const metadata = {
  title: "एनालिटिक्स",
};

/**
 * The ADMIN-only role check already happened in
 * app/admin/(dashboard)/analytics/layout.tsx — this page just renders the
 * dashboard, which does its own client-side data fetching against
 * app/api/admin/analytics/*.
 */
export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
