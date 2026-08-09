import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/session";

/**
 * ADMIN-only gate for every /admin/analytics/* route. The parent dashboard
 * layout (app/admin/(dashboard)/layout.tsx) already proves the visitor is
 * logged in; this adds the stricter role check analytics needs — there is
 * no "analytics viewer" role in this codebase's RBAC (see
 * backend/app/core/deps.py: require_admin vs require_editor_or_admin), so
 * EDITOR/AUTHOR must not reach these pages even by typing the URL directly
 * (the nav entry is already hidden for them — see lib/admin-nav.ts — but
 * that alone doesn't stop direct navigation).
 *
 * This is a frontend convenience redirect, not the security boundary — the
 * backend independently enforces require_admin on every /analytics/*
 * endpoint, so even if this check were bypassed, no data would leak.
 */
export default async function AnalyticsLayout({ children }: { children: ReactNode }) {
  const user = await getAuthenticatedUser();

  if (!user || user.role !== "admin") {
    redirect("/admin");
  }

  return <>{children}</>;
}
