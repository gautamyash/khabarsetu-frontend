"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { UI_TEXT } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { SearchForm } from "@/components/layout/SearchForm";
import type { AdminCategory } from "@/types/category";

const MENU_PANEL_ID = "mobile-menu-panel";

/** Categories come from Header (fetched once, real data — see
 * lib/categories-api.ts) rather than being re-fetched or hardcoded here. */
export function MobileMenuToggle({ categories }: { categories: AdminCategory[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  // Keyboard-friendly close: Escape works no matter which element inside
  // the panel currently has focus.
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={MENU_PANEL_ID}
        aria-label={open ? UI_TEXT.close : UI_TEXT.menu}
        className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface hover:bg-surface-container-highest"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div
          id={MENU_PANEL_ID}
          className="absolute inset-x-0 top-full z-40 border-t border-outline-variant bg-surface-container-lowest px-4 py-4 shadow-lg"
        >
          <SearchForm className="mb-4" />
          <nav aria-label={UI_TEXT.menu}>
            <ul className="flex flex-col divide-y divide-outline-variant">
              <li>
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  aria-current={isHome ? "page" : undefined}
                  className={cn(
                    "block py-3 text-base font-bold",
                    isHome ? "text-primary" : "text-on-surface hover:text-primary"
                  )}
                >
                  {UI_TEXT.home}
                </Link>
              </li>
              {categories.map((category) => {
                const href = `/category/${category.slug}`;
                const isActive = pathname === href;
                return (
                  <li key={category.slug}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "block py-3 text-base font-bold",
                        isActive ? "text-primary" : "text-on-surface hover:text-primary"
                      )}
                    >
                      {category.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
