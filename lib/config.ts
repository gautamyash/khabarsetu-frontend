/**
 * The FastAPI backend's base URL. Public by design (it's just a hostname,
 * not a secret) — see NEXT_PUBLIC_API_URL in .env.local / .env.example.
 * Never put actual secrets (JWT_SECRET_KEY, DB credentials, ...) in a
 * NEXT_PUBLIC_* variable; those stay backend-only.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
