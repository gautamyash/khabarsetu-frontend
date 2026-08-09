"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus, X } from "lucide-react";
import { getVisibleNavItems } from "@/lib/admin-nav";
import { SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/admin/LogoutButton";
import type { AuthUser } from "@/types/auth";

function isItemActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Compact dark top bar + drawer for the admin area on mobile — mirrors the
 * dark newsroom theme of AdminSidebar (used on desktop instead). */
export function AdminMobileNav({ user }: { user: AuthUser }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const navItems = getVisibleNavItems(user.role);

  return (
    <div className="border-b border-white/10 bg-ink-900 lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/admin" className="font-serif-hi text-base font-bold text-white">
          {SITE_NAME} <span className="text-xs font-normal text-ink-400">व्यवस्थापक</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <Link
            href="/admin/news/new"
            aria-label="नई खबर"
            className="flex h-9 items-center gap-1.5 rounded-sm bg-brand-700 px-3 text-xs font-semibold text-white hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" aria-hidden />
            नई खबर
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="admin-mobile-menu-panel"
            aria-label={open ? "बंद करें" : "मेन्यू"}
            className="flex h-9 w-9 items-center justify-center rounded-sm text-ink-200 hover:bg-white/10"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="admin-mobile-menu-panel" className="border-t border-white/10 px-4 py-3">
          <nav aria-label="व्यवस्थापक मेन्यू">
            <ul className="flex flex-col divide-y divide-white/10">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = item.enabled && isItemActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    {item.enabled ? (
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 py-3 text-sm font-medium",
                          active ? "text-white" : "text-ink-300"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                        {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />}
                      </Link>
                    ) : (
                      <span className="flex cursor-not-allowed items-center gap-3 py-3 text-sm text-ink-500">
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-2 border-t border-white/10 pt-2">
            <LogoutButton variant="dark" />
          </div>
        </div>
      )}
    </div>
  );
}
