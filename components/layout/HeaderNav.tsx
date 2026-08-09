"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { UI_TEXT } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AdminCategory } from "@/types/category";

/** Categories beyond this count move into the "और" overflow menu, so a long
 * category list can never stretch or wrap the nav strip. */
const MAX_VISIBLE = 7;

const LINK_BASE = "flex items-center border-b-2 pb-1 text-sm font-bold transition-colors";

/**
 * Full, mutually-exclusive class strings for each state — deliberately NOT
 * built by concatenating a "default" text/border color with a conditional
 * "active" text/border color via cn(). This codebase's cn() is a plain
 * joiner with no tailwind-merge dedup, so two same-property utility classes
 * (e.g. text-on-surface AND text-primary) landing in the same className
 * string are resolved by Tailwind's generated stylesheet order — not by
 * source order — which previously made the "active" color unreliable
 * (it sometimes lost to the "default" color). Picking one complete class
 * string per state avoids the conflict entirely.
 */
function linkClass(active: boolean): string {
  return cn(
    LINK_BASE,
    active ? "border-primary text-primary" : "border-transparent text-on-surface hover:text-primary"
  );
}

/**
 * Desktop category strip — a thin, centered row of text links between two
 * hairline rules under the masthead, matching the Stitch Homepage
 * reference's nav (no filled pill background, no uppercase). A client
 * component (rather than inline in the async Server Component Header)
 * only because active-state highlighting needs the current pathname,
 * which requires usePathname(). Categories are fetched once by Header and
 * passed in here, not re-fetched.
 */
export function HeaderNav({ categories }: { categories: AdminCategory[] }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const visible = categories.slice(0, MAX_VISIBLE);
  const overflow = categories.slice(MAX_VISIBLE);

  return (
    <nav aria-label={UI_TEXT.home} className="hidden border-t border-b border-outline-variant py-3 lg:block">
      <ul className="flex items-center justify-center gap-8">
        <li>
          <Link
            href="/"
            aria-current={isHome ? "page" : undefined}
            className={linkClass(isHome)}
          >
            {UI_TEXT.home}
          </Link>
        </li>
        {visible.map((category) => {
          const href = `/category/${category.slug}`;
          const isActive = pathname === href;
          return (
            <li key={category.slug}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={linkClass(isActive)}
              >
                {category.name}
              </Link>
            </li>
          );
        })}
        {overflow.length > 0 && <OverflowMenu categories={overflow} pathname={pathname} />}
      </ul>
    </nav>
  );
}

function OverflowMenu({
  categories,
  pathname,
}: {
  categories: AdminCategory[];
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLLIElement>(null);
  const isActiveInOverflow = categories.some((c) => pathname === `/category/${c.slug}`);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <li ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(linkClass(isActiveInOverflow), "gap-1")}
      >
        और
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      {open && (
        <ul
          role="menu"
          className="absolute top-full left-0 z-30 mt-2 w-48 rounded-md border border-outline-variant bg-surface-container-lowest py-1.5 shadow-lg"
        >
          {categories.map((category) => {
            const href = `/category/${category.slug}`;
            const isActive = pathname === href;
            return (
              <li key={category.slug} role="none">
                <Link
                  href={href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "block px-4 py-2 text-sm font-semibold hover:bg-surface-container",
                    isActive ? "text-primary" : "text-on-surface hover:text-primary"
                  )}
                >
                  {category.name}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}
