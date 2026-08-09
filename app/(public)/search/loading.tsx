import { Container } from "@/components/ui/Container";

/**
 * Suspense fallback shown by Next.js while the search page's async Server
 * Component (page.tsx) is running the query against the backend — mirrors
 * the header band + horizontal result-row shape.
 */
export default function Loading() {
  return (
    <>
      <div className="border-b border-on-surface bg-surface-container-low/40">
        <Container className="py-6">
          <div className="h-9 w-40 animate-pulse bg-surface-container-high" />
          <div className="mt-4 h-10 w-full max-w-md animate-pulse bg-surface-container-high" />
        </Container>
      </div>
      <Container className="py-8">
        <div className="space-y-5 border-t border-outline-variant pt-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 border-b border-outline-variant pb-5">
              <div className="hidden h-28 w-44 shrink-0 animate-pulse bg-surface-container sm:block" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-5 w-full animate-pulse bg-surface-container" />
                <div className="h-3.5 w-3/4 animate-pulse bg-surface-container" />
                <div className="h-3 w-1/3 animate-pulse bg-surface-container" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
