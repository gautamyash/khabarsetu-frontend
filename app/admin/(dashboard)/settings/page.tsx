import type { Metadata } from "next";
import { getAuthenticatedUser } from "@/lib/session";
import { getSiteSettingsForAdmin } from "@/lib/site-settings-api";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";

export const metadata: Metadata = {
  title: "सेटिंग्स",
};

/**
 * Only ADMIN may edit settings — enforced authoritatively by the backend
 * (require_admin on PUT /settings). This page still checks the role itself
 * so an EDITOR/AUTHOR who navigates here directly sees a clear Hindi
 * message instead of a form that would fail on submit — the same
 * "frontend role checks are UX only" pattern already used for media
 * deletion (see MediaGrid's canDelete prop).
 */
export default async function AdminSettingsPage() {
  const user = await getAuthenticatedUser();
  const isAdmin = user?.role === "admin";

  let settings: Awaited<ReturnType<typeof getSiteSettingsForAdmin>> | null = null;
  let loadError: string | null = null;

  try {
    settings = await getSiteSettingsForAdmin();
  } catch {
    loadError = "सेटिंग्स लोड नहीं हो सकीं। कृपया पृष्ठ को पुनः लोड करें।";
  }

  return (
    <div>
      <h1 className="font-serif-hi text-2xl font-bold text-ink-900">सेटिंग्स</h1>
      <p className="mt-2 text-sm text-ink-600">साइट की सामान्य और संपर्क जानकारी प्रबंधित करें।</p>

      <div className="mt-6">
        {loadError || !settings ? (
          <p className="rounded-md border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700">
            {loadError ?? "सेटिंग्स लोड नहीं हो सकीं।"}
          </p>
        ) : !isAdmin ? (
          <p className="rounded-md border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-600">
            यह सुविधा केवल एडमिन के लिए उपलब्ध है।
          </p>
        ) : (
          <SiteSettingsForm settings={settings} />
        )}
      </div>
    </div>
  );
}
