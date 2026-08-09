import { Container } from "@/components/ui/Container";

/**
 * Suspense fallback shown by Next.js while the homepage's async Server
 * Component (app/(public)/page.tsx) is fetching real article data — mirrors
 * the hero + latest-news grid shape instead of a bare "loading" line.
 */
export default function Loading() {
  return (
    <>
      <Container className="border-b border-on-surface py-8">
        <div className="h-6 w-32 animate-pulse bg-surface-container-high" />
        <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="aspect-[4/3] w-full animate-pulse bg-surface-container sm:aspect-[16/9] lg:col-span-2" />
          <div className="space-y-4 lg:col-span-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-16 w-24 shrink-0 animate-pulse bg-surface-container" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3.5 w-full animate-pulse bg-surface-container" />
                  <div className="h-3.5 w-2/3 animate-pulse bg-surface-container" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>

      <div className="border-b border-outline-variant bg-surface-container-low/40">
        <Container className="py-10">
          <div className="h-6 w-32 animate-pulse bg-surface-container-high" />
          <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[4/3] w-full animate-pulse bg-surface-container" />
                <div className="h-4 w-2/3 animate-pulse bg-surface-container" />
                <div className="h-3 w-1/3 animate-pulse bg-surface-container" />
              </div>
            ))}
          </div>
        </Container>
      </div>
    </>
  );
}
