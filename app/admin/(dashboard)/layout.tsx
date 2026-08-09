import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/session";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

/**
 * Authoritative auth guard for the admin dashboard.
 *
 * `proxy.ts` already redirects unauthenticated requests away from /admin
 * based on cookie *presence*; this layout is the real check — it asks the
 * backend to resolve the token (GET /api/v1/auth/me) and redirects to
 * /admin/login if that fails (missing, expired, or tampered token).
 */
export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar user={user} className="hidden lg:flex" />

      <div className="flex min-h-screen flex-1 flex-col">
        <AdminMobileNav user={user} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
