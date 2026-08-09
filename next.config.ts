import type { NextConfig } from "next";

// Uploaded media is served directly by the FastAPI backend (see
// backend/app/main.py's StaticFiles mount at MEDIA_URL_PREFIX), a different
// origin than the Next.js app in dev — next/image needs that origin
// explicitly allow-listed, or it refuses to render the image at runtime.
// Derived from the same env var the rest of the app already uses for the
// backend URL (lib/config.ts), so nothing here is hardcoded.
//
// The pathname is intentionally left open ("/**", any path on that origin)
// rather than pinned to "/uploads/**": the backend's media path prefix
// (MEDIA_URL_PREFIX, see backend/app/core/config.py) is its own,
// independently configurable setting, and there's no shared env var to
// derive it from here. The actual security boundary this config exists to
// enforce is the origin allow-list (protocol+hostname+port) — restricting
// by domain is what keeps this from being "arbitrary remote domains"; a
// path restriction on top of that would only add fragility (two settings,
// in two codebases, that would need to be kept in sync by hand) without a
// real security benefit, since this is the app's own single-purpose media
// origin, not a shared/multi-tenant host.
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const backendOrigin = new URL(apiUrl);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: backendOrigin.protocol.replace(":", "") as "http" | "https",
        hostname: backendOrigin.hostname,
        port: backendOrigin.port,
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
