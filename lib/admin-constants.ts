import type { ArticleStatus } from "@/types/article";

export interface ArticleStatusConfig {
  label: string;
  /** Tailwind classes for the small status badge shown in the news table. */
  badgeClassName: string;
}

/**
 * Single source of truth for article status — label text and badge styling
 * both live here so no component hardcodes "ड्राफ्ट"/"प्रकाशित"/"संग्रहीत"
 * or its own color mapping. Everything else on this page (labels list,
 * filter options) is derived from this one object.
 */
export const ARTICLE_STATUS_CONFIG: Record<ArticleStatus, ArticleStatusConfig> = {
  draft: { label: "ड्राफ्ट", badgeClassName: "bg-ink-100 text-ink-600" },
  published: { label: "प्रकाशित", badgeClassName: "bg-green-50 text-green-700" },
  archived: { label: "संग्रहीत", badgeClassName: "bg-amber-50 text-amber-700" },
};

const STATUS_ENTRIES = Object.entries(ARTICLE_STATUS_CONFIG) as [ArticleStatus, ArticleStatusConfig][];

/** Hindi labels for article status — never render the raw enum value. */
export const ARTICLE_STATUS_LABELS: Record<ArticleStatus, string> = Object.fromEntries(
  STATUS_ENTRIES.map(([status, config]) => [status, config.label])
) as Record<ArticleStatus, string>;

export const ARTICLE_STATUS_OPTIONS: { value: ArticleStatus; label: string }[] = STATUS_ENTRIES.map(
  ([value, config]) => ({ value, label: config.label })
);

export const DEFAULT_PAGE_SIZE = 20;
