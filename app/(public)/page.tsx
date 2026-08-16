import { Newspaper, TriangleAlert } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PublicEmptyState } from "@/components/ui/PublicEmptyState";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { BreakingNewsBar } from "@/components/layout/BreakingNewsBar";
import { HomeSectionHeading } from "@/components/home/HomeSectionHeading";
import { HeroStory } from "@/components/home/HeroStory";
import { StoryRow } from "@/components/home/StoryRow";
import { SecondRowStory } from "@/components/home/SecondRowStory";
import { CategoryNewsSection } from "@/components/news/CategoryNewsSection";
import {
  getBreakingArticles,
  getFeaturedArticles,
  getLatestArticles,
  getArticlesByCategoryId,
} from "@/lib/public-articles-api";
import { listCategories } from "@/lib/categories-api";
import { UI_TEXT } from "@/lib/constants";
import type { Article } from "@/types/news";

// Without this, `/` has no dynamic API usage (no searchParams/cookies/
// headers) and no revalidate config, so Next's default is to statically
// render it once (Full Route Cache) and serve that same snapshot on every
// request thereafter — confirmed in production: the homepage was serving a
// render from a prior day while /category/[slug] (which reads
// searchParams, forcing dynamic rendering) and /news/[slug] stayed fresh.
//
// `force-dynamic` fixed that staleness bug, but it also means every single
// visitor re-runs loadHomeData()'s 5 Supabase-backed /articles requests —
// confirmed as the top Supabase egress source in the egress audit. A
// time-based revalidation window fixes the same staleness bug (the page
// can never again get stuck on a snapshot from days ago — it's rebuilt at
// least once every 60s) while collapsing however many visitors arrive
// within each 60s window down to a single re-run of loadHomeData(), same
// as ISR. 60s was chosen as a starting point: short enough that a newly
// published/breaking article shows up within a minute (this is a live news
// site, not a low-frequency blog), long enough to absorb realistic traffic
// bursts without re-querying Supabase per visitor. No query, filter,
// ordering, or UI logic changes — only how often the existing render runs.
export const revalidate = 60;

interface HomeData {
  breaking: Article[];
  featured: Article[];
  latest: Article[];
  mpNews: Article[];
  sportsNews: Article[];
}

async function loadHomeData(): Promise<HomeData> {
  const categories = await listCategories();
  const mpCategory = categories.find((c) => c.slug === "madhya-pradesh");
  const sportsCategory = categories.find((c) => c.slug === "khel");

  const [breaking, featured, latest, mpNews, sportsNews] = await Promise.all([
    getBreakingArticles(),
    getFeaturedArticles(),
    getLatestArticles(16),
    mpCategory ? getArticlesByCategoryId(mpCategory.id, 5) : Promise.resolve([]),
    sportsCategory ? getArticlesByCategoryId(sportsCategory.id, 5) : Promise.resolve([]),
  ]);

  return { breaking, featured, latest, mpNews, sportsNews };
}

/**
 * The hero area's empty state — rendered INSIDE the hero grid, occupying
 * the full lead-story width rather than floating as a small isolated card
 * on an otherwise blank page. The rest of the homepage still renders
 * around it, so a zero-article database still reads as a newspaper that
 * hasn't published today's edition yet, not a broken page.
 */
function HeroEmptyState() {
  return (
    <PublicEmptyState
      icon={Newspaper}
      size="lg"
      title="अभी खबरें प्रकाशित नहीं हुई हैं"
      message="नई खबर प्रकाशित होते ही वह यहां दिखाई देगी।"
      className="my-6"
    />
  );
}

/**
 * Homepage — rebuilt to match the Stitch `Homepage` desktop reference and
 * the `25_mobile_1` mobile reference (see stitch_25/): a masthead header
 * (Header.tsx) + two-tone breaking ticker, a 12-col hero grid (lead story
 * with an editorial-divider rule beside a text-only "मुख्य खबरें" list),
 * a 3-col second row with the same divider/alternating-image rhythm, then
 * the site's existing "ताज़ा खबरें" grid / "और खबरें" + "सबसे ज़्यादा
 * पढ़ी गई" split / category sections — restyled with the same Stitch
 * tokens (home/* components) rather than removed, since the reference
 * mockup itself is a partial page and the task explicitly asks for
 * category sections and section headings to be matched, not dropped.
 * All content is real, fetched the same way as before — only the markup
 * and styling changed.
 */
export default async function Home() {
  let data: HomeData | null = null;
  let errorMessage: string | null = null;

  try {
    data = await loadHomeData();
  } catch {
    errorMessage = "खबरें लोड नहीं हो सकीं।";
  }

  if (errorMessage) {
    return (
      <Container className="py-12">
        <PublicEmptyState
          icon={TriangleAlert}
          size="lg"
          title="कुछ गलत हो गया"
          message={`${errorMessage} कृपया पृष्ठ को पुनः लोड करें।`}
        />
      </Container>
    );
  }

  const { breaking, featured, latest, mpNews, sportsNews } = data!;

  // If nothing is marked is_featured yet, fall back to the most recent
  // published articles (already fetched above — no extra request) rather
  // than leaving the hero area empty.
  const heroSource = featured.length > 0 ? featured : latest;
  const [heroArticle, ...secondaryFeatured] = heroSource;
  const sidebarStories = secondaryFeatured.slice(0, 4);
  const secondRow = secondaryFeatured.slice(4, 7);

  const usedIds = new Set([heroArticle?.id, ...sidebarStories.map((a) => a.id), ...secondRow.map((a) => a.id)]);
  const latestForGrid = (featured.length > 0 ? latest : latest.filter((a) => !usedIds.has(a.id))).slice(0, 6);
  const moreNews = latest.slice(0, 6);
  const mostRead = latest.slice(0, 5);

  return (
    <>
      <PageViewTracker eventType="page_view" path="/" />
      <BreakingNewsBar articles={breaking} />

      {/* Hero editorial grid — lead story + text-only "मुख्य खबरें" list.
          WHITE band: the front page's lead story, deliberately plain so it
          contrasts against the cream band immediately below it. */}
      <Container className="border-b border-on-surface py-8 lg:pb-12">
        {heroArticle ? (
          <>
            <HomeSectionHeading kicker="आज की" title="प्रमुख खबर" className="mb-6 sm:mb-7" />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="editorial-divider pb-8 lg:col-span-8 lg:pr-6 lg:pb-0">
                <HeroStory article={heroArticle} priority />
              </div>
              {sidebarStories.length > 0 && (
                <aside className="flex flex-col rounded-lg bg-surface-container-low/60 p-5 lg:col-span-4 lg:p-6">
                  <div className="mb-3 flex items-center gap-2.5">
                    <span className="h-[3px] w-9 shrink-0 bg-primary" aria-hidden />
                    <span className="text-[11px] font-bold tracking-[0.18em] text-primary uppercase">इसे भी पढ़ें</span>
                  </div>
                  <h2 className="font-serif-hi mb-3 border-b-2 border-on-surface pb-3 text-xl font-black text-on-surface">
                    मुख्य खबरें
                  </h2>
                  {sidebarStories.map((article) => (
                    <StoryRow key={article.id} article={article} showTime={false} />
                  ))}
                </aside>
              )}
            </div>
          </>
        ) : (
          <HeroEmptyState />
        )}
      </Container>

      {/* Second row — 3-col editorial grid, text/image/text rhythm.
          CREAM band: the "important coverage right after the lead story"
          module, full-bleed so it reads as a distinct editorial section
          rather than another card grid on the same white page. */}
      {secondRow.length > 0 && (
        <div className="border-b border-outline-variant bg-surface-container-low">
          <Container className="py-10">
            <HomeSectionHeading kicker="प्रमुख कवरेज" title="अहम खबरें" />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {secondRow.map((article, i) => (
                <SecondRowStory key={article.id} article={article} showImage={i === 1} />
              ))}
            </div>
          </Container>
        </div>
      )}

      {/* ताज़ा खबरें — dense grid of the remaining latest stories.
          WHITE band again, restoring contrast against the cream module
          above before the very-light-cream trending module below. */}
      <div className="border-b border-outline-variant">
        <Container className="py-10">
          <HomeSectionHeading kicker="अपडेट" title={UI_TEXT.latestNews} />
          {latestForGrid.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {latestForGrid.map((article) => (
                <SecondRowStory key={article.id} article={article} showImage />
              ))}
            </div>
          ) : (
            <PublicEmptyState icon={Newspaper} title="अभी कोई खबर उपलब्ध नहीं है" />
          )}
        </Container>
      </div>

      {/* और खबरें + सबसे ज़्यादा पढ़ी गई — VERY LIGHT cream band (a lighter
          tint than the second-row module above) so the "trending" module
          feels like its own editorial desk without repeating the exact
          same beige weight twice on one page. */}
      {moreNews.length > 0 && (
        <div className="border-b border-outline-variant bg-surface-container-low/35">
          <Container className="py-10">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
              <section className="lg:col-span-2">
                <HomeSectionHeading kicker="विस्तार से" title="और खबरें" />
                <div className="flex flex-col">
                  {moreNews.map((article, i) => (
                    <StoryRow key={article.id} article={article} showImage={i % 4 === 3} />
                  ))}
                </div>
              </section>

              <aside className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-5 lg:p-6">
                <HomeSectionHeading kicker="ट्रेंडिंग" title="सबसे ज़्यादा पढ़ी गई" />
                <div className="flex flex-col">
                  {mostRead.map((article, i) => (
                    <StoryRow key={article.id} article={article} index={i + 1} showCategory={false} showTime={false} />
                  ))}
                </div>
              </aside>
            </div>
          </Container>
        </div>
      )}

      {/* Category sections — only for categories that actually have articles */}
      <Container>
        <CategoryNewsSection title="मध्यप्रदेश" kicker="क्षेत्रीय" categorySlug="madhya-pradesh" articles={mpNews} />
        <CategoryNewsSection title="खेल" kicker="स्पोर्ट्स डेस्क" categorySlug="khel" articles={sportsNews} />
      </Container>
    </>
  );
}
