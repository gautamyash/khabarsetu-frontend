type ClassValue = string | number | null | boolean | undefined;

/** Minimal className joiner — avoids pulling in clsx/tailwind-merge for one helper. */
export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(" ");
}

const hindiDateFormatter = new Intl.DateTimeFormat("hi-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const hindiWeekdayDateFormatter = new Intl.DateTimeFormat("hi-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Formats a Date as a Hindi-locale weekday + date, e.g. "रविवार, 9 अगस्त
 * 2026" — used in the header's utility bar. */
export function formatHindiWeekdayDate(date: Date): string {
  return hindiWeekdayDateFormatter.format(date);
}

const hindiTimeFormatter = new Intl.DateTimeFormat("hi-IN", {
  hour: "numeric",
  minute: "numeric",
  hour12: true,
});

/** Formats an ISO date string as a Hindi-locale date, e.g. "8 अगस्त 2026". */
export function formatHindiDate(isoDate: string): string {
  return hindiDateFormatter.format(new Date(isoDate));
}

/** Formats an ISO date string as a Hindi-locale time, e.g. "5:30 pm". */
export function formatHindiTime(isoDate: string): string {
  return hindiTimeFormatter.format(new Date(isoDate));
}

/** Relative "x घंटे पहले" style label for recent timestamps. */
export function formatRelativeHindi(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "अभी-अभी";
  if (diffMinutes < 60) return `${diffMinutes} मिनट पहले`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} घंटे पहले`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} दिन पहले`;

  return formatHindiDate(isoDate);
}

/** Formats a byte count as a compact size label, e.g. "245 KB", "1.2 MB" —
 * used by the media grid and preview modal. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}
