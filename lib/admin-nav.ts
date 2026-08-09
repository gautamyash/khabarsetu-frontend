import { BarChart3, FolderTree, ImageIcon, LayoutDashboard, Newspaper, Settings } from "lucide-react";
import type { ComponentType } from "react";
import type { UserRole } from "@/types/auth";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  /** Every item here now maps to a real, working route — a disabled entry
   *  should only ever exist for a route that genuinely isn't built yet. */
  enabled: boolean;
  /** Restricts the item to specific roles. Omitted = visible to every
   *  logged-in role (the existing default for every item before analytics).
   *  Analytics is ADMIN-only — there is no "analytics viewer" role in this
   *  codebase's RBAC (see backend/app/core/deps.py), so EDITOR/AUTHOR must
   *  not see or reach it. */
  roles?: UserRole[];
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "डैशबोर्ड", href: "/admin", icon: LayoutDashboard, enabled: true },
  { label: "खबरें", href: "/admin/news", icon: Newspaper, enabled: true },
  { label: "श्रेणियां", href: "/admin/categories", icon: FolderTree, enabled: true },
  { label: "मीडिया", href: "/admin/media", icon: ImageIcon, enabled: true },
  { label: "एनालिटिक्स", href: "/admin/analytics", icon: BarChart3, enabled: true, roles: ["admin"] },
  { label: "सेटिंग्स", href: "/admin/settings", icon: Settings, enabled: true },
];

/** Nav items visible to a given role — filters out anything role-restricted
 *  to a different role. Used by both AdminSidebar (desktop) and
 *  AdminMobileNav (mobile) so the two never drift out of sync. */
export function getVisibleNavItems(role: UserRole): AdminNavItem[] {
  return ADMIN_NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
}
