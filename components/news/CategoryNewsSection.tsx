import type { Article } from "@/types/news";
import { HomeSectionHeading } from "@/components/home/HomeSectionHeading";
import { HeroStory } from "@/components/home/HeroStory";
import { StoryRow } from "@/components/home/StoryRow";
import { UI_TEXT } from "@/lib/constants";

/**
 * A titled editorial block for a single category — one lead story beside
 * a dense list of supporting stories, built from the same home/* pieces
 * as the rest of the homepage so category sections read as part of the
 * same Stitch-matched page rather than a differently-styled leftover.
 * Homepage-only component (see app/(public)/page.tsx) — the standalone
 * /category/[slug] page is untouched and keeps its own card components.
 */
export function CategoryNewsSection({
  title,
  kicker,
  categorySlug,
  articles,
}: {
  title: string;
  /** Small uppercase label above the category title, e.g. "क्षेत्रीय" —
   * purely decorative page chrome, same as HomeSectionHeading's own
   * kicker prop (passed straight through). */
  kicker?: string;
  categorySlug: string;
  articles: Article[];
}) {
  if (articles.length === 0) return null;

  const [primary, ...rest] = articles;
  const supporting = rest.slice(0, 4);

  return (
    <section className="border-t border-outline-variant py-10 first:border-t-0">
      <HomeSectionHeading
        kicker={kicker}
        title={title}
        href={`/category/${categorySlug}`}
        linkLabel={UI_TEXT.readMore}
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <HeroStory article={primary} />
        </div>
        {supporting.length > 0 && (
          <div className="flex flex-col lg:col-span-2 lg:border-l lg:border-outline-variant lg:pl-8">
            {supporting.map((article) => (
              <StoryRow key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
