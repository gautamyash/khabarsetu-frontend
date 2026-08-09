import { Container } from "@/components/ui/Container";

/**
 * Suspense fallback shown by Next.js while the article detail page's async
 * Server Component (page.tsx) is fetching the article by slug — mirrors the
 * breadcrumb + two-column headline/body/sidebar shape.
 */
export default function Loading() {
  return (
    <Container className="py-6">
      <div className="h-3 w-40 animate-pulse bg-surface-container" />
      <div className="mt-4 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="h-5 w-24 animate-pulse bg-surface-container-high" />
          <div className="mt-3 h-10 w-full animate-pulse bg-surface-container" />
          <div className="mt-2 h-10 w-3/4 animate-pulse bg-surface-container" />
          <div className="mt-5 h-10 w-full animate-pulse bg-surface-container" />
          <div className="mt-6 aspect-[16/9] w-full animate-pulse bg-surface-container" />
          <div className="mt-8 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 w-full animate-pulse bg-surface-container" />
            ))}
          </div>
        </div>
        <div className="space-y-4 lg:col-span-1 lg:border-l lg:border-outline-variant lg:pl-8">
          {Array.from({ length: 4 }).map((_, i) => (
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
  );
}
