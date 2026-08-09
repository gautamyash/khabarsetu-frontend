import Link from "next/link";
import { cn } from "@/lib/utils";

export function CategoryBadge({
  name,
  slug,
  variant = "default",
  className,
}: {
  name: string;
  slug: string;
  variant?: "default" | "onImage";
  className?: string;
}) {
  return (
    <Link
      href={`/category/${slug}`}
      className={cn(
        "inline-flex items-center bg-brand-700 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase transition-colors hover:bg-brand-800",
        variant === "onImage" && "shadow-sm",
        className
      )}
    >
      {name}
    </Link>
  );
}
