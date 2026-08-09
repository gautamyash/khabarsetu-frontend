"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/Container";

/**
 * Public route-group error boundary. Next.js passes the thrown error in,
 * but its message/stack is never rendered here — only a generic Hindi
 * message — so a backend failure or unexpected exception can't leak
 * internal details (stack traces, DB errors, file paths) to a visitor.
 * `error` is still logged to the server console for debugging.
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex flex-col items-center justify-center py-24 text-center">
      <p className="font-serif-hi text-6xl font-bold text-outline-variant">!</p>
      <h1 className="mt-4 text-2xl font-bold text-on-surface">कुछ गलत हो गया।</h1>
      <p className="mt-2 max-w-md text-on-surface-variant">
        यह पृष्ठ लोड करने में समस्या हुई। कृपया पुनः प्रयास करें।
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 bg-primary px-6 py-3 text-sm font-bold text-on-primary hover:opacity-90"
      >
        पुनः प्रयास करें
      </button>
    </Container>
  );
}
