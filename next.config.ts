import type { NextConfig } from "next";

// Uploaded media is served from two origins: the FastAPI backend (see
// backend/app/main.py's StaticFiles mount at MEDIA_URL_PREFIX), still used
// for whatever rows predate the Supabase Storage migration, and the
// Supabase Storage "news-media" bucket, used for every new upload as of
// that migration. Both are different origins than the Next.js app in dev —
// next/image needs each explicitly allow-listed, or it refuses to render
// the image at runtime.
//
// The pathname is intentionally left open ("/**", any path on that origin)
// rather than pinned to a specific prefix: the actual security boundary
// this config exists to enforce is the origin allow-list (protocol+
// hostname+port) — restricting by path on top of that would only add
// fragility without a real security benefit, since each of these is the
// app's own single-purpose media origin, not a shared/multi-tenant host.
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const backendOrigin = new URL(apiUrl);

// The Supabase project's own URL — the same project already used for the
// database (see backend/.env's DATABASE_URL host) and for Storage. This is
// the project's public URL, not a secret (unlike the service_role key,
// which stays backend-only and is never referenced here) — it's the same
// URL Supabase's own client-side SDKs embed directly in browser bundles, so
// hardcoding it here keeps this a single-file, self-contained change rather
// than introducing a new NEXT_PUBLIC_SUPABASE_URL env var nothing else in
// the frontend uses yet.
const supabaseOrigin = new URL("https://gnrginstunclokgqxtkp.supabase.co");

const nextConfig: NextConfig = {
  images: {
    // TEMPORARY: Vercel's own Image Optimization service is currently
    // returning 402 Payment Required (error code
    // OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED) once its monthly
    // transformation quota is used up — confirmed live on production by
    // inspecting failed /_next/image requests. Already-cached optimized
    // variants keep loading fine, which is why this only shows up as
    // freshly published articles' images failing to render. `unoptimized`
    // makes next/image render a plain <img src=originalUrl> for every
    // image in the app, skipping Vercel's paid optimizer entirely — images
    // are served directly from their origin (Supabase Storage/backend)
    // instead. Safe to do here because every uploaded image is already
    // capped at 200KB (see backend/app/core/config.py's
    // MAX_UPLOAD_SIZE_BYTES), so serving originals unresized isn't a heavy
    // egress or performance regression. Remove this once the Vercel plan's
    // Image Optimization quota/billing is resolved, to restore automatic
    // resizing and modern-format (webp) conversion.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: backendOrigin.protocol.replace(":", "") as "http" | "https",
        hostname: backendOrigin.hostname,
        port: backendOrigin.port,
        pathname: "/**",
      },
      {
        protocol: supabaseOrigin.protocol.replace(":", "") as "http" | "https",
        hostname: supabaseOrigin.hostname,
        port: supabaseOrigin.port,
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
