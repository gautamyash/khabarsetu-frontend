import { Container } from "@/components/ui/Container";

/**
 * Suspense fallback shown by Next.js while the category page's async
 * Server Component (page.tsx) is loading the category and its articles —
 * mirrors the header band + lead story + grid shape.
 */
export default function Loading() {
  return (
    <>
      <div className="border-b border-on-surface bg-surface-container-low/40">
        <Container className="py-6">
          <div className="h-9 w-48 animate-pulse bg-surface-container-high" />
        </Container>
      </div>
      <Container className="py-8">
        <div className="h-6 w-32 animate-pulse bg-surface-container-high" />
        <div className="mt-5 aspect-[4/3] w-full animate-pulse bg-surface-container sm:aspect-[16/9]" />
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[4/3] w-full animate-pulse bg-surface-container" />
              <div className="h-4 w-2/3 animate-pulse bg-surface-container" />
              <div className="h-3 w-1/3 animate-pulse bg-surface-container" />
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
