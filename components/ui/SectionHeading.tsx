import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  href,
  linkLabel,
  className,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  // A solid crimson "flag" with white text, in the tradition of Hindi
  // newspaper section headers (Dainik Bhaskar / Amar Ujala style) — not a
  // thin accent bar next to black text. The flag is followed by a bold
  // black rule that carries the section's visual weight across the rest of
  // the row, so every section on the page reads as a clearly marked block.
  return (
    <div className={cn("mb-5 flex items-center gap-3", className)}>
      <h2 className="font-serif-hi shrink-0 bg-brand-700 px-4 py-2.5 text-lg font-extrabold tracking-tight text-white sm:px-5 sm:py-3 sm:text-xl">
        {title}
      </h2>
      <span className="h-[3px] flex-1 bg-ink-900" aria-hidden />
      {href && linkLabel && (
        <Link
          href={href}
          className="group flex shrink-0 items-center gap-1 text-sm font-bold tracking-wide text-brand-700 uppercase transition-colors hover:text-brand-800"
        >
          {linkLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
    </div>
  );
}
