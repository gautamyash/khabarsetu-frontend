"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { getVisibleNavItems } from "@/lib/admin-nav";
import { SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/admin/LogoutButton";
import type { AuthUser, UserRole } from "@/types/auth";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "एडमिन",
  editor: "संपादक",
  author: "लेखक",
};

/** Active match: exact for the dashboard root ("/admin"), prefix match for
 * everything else so a nested route like /admin/news/123/edit still keeps
 * "खबरें" highlighted. */
function isItemActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Persistent desktop sidebar for the admin area — a dark "newsroom" chrome
 * (bg-ink-900) rather than a light generic-dashboard sidebar, so the admin
 * panel reads as its own distinct product from the public site instead of
 * a plain CRUD backend. Hidden on mobile — see AdminMobileNav.
 */
export function AdminSidebar({ user, className }: { user: AuthUser; className?: string }) {
  const pathname = usePathname();
  const initial = user.name.trim().charAt(0).toUpperCase() || "?";
  const navItems = getVisibleNavItems(user.role);

  return (
    <aside className={cn("w-64 shrink-0 flex-col bg-ink-900 text-ink-200", className)}>
      <div className="border-b border-white/10 px-5 py-5">
        <Link href="/admin" className="font-serif-hi text-lg font-bold text-white">
          {SITE_NAME}
        </Link>
        <p className="mt-0.5 text-xs text-ink-400">न्यूज़रूम प्रबंधन</p>
      </div>

      <div className="px-3 pt-4">
        <Link
          href="/admin/news/new"
          className="flex items-center justify-center gap-2 rounded-sm bg-brand-700 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" aria-hidden />
          नई खबर
        </Link>
      </div>

      <nav aria-label="व्यवस्थापक मेन्यू" className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (!item.enabled) {
            return (
              <span
                key={item.href}
                title="जल्द आ रहा है"
                className="flex cursor-not-allowed items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-ink-500"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
            );
          }

          const active = isItemActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-white/10 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {active && <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="mb-1 flex items-center gap-2.5 px-2 py-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">{user.name}</p>
            <p className="truncate text-[11px] text-ink-400">{ROLE_LABELS[user.role]}</p>
          </div>
        </div>
        <LogoutButton variant="dark" />
      </div>
    </aside>
  );
}
