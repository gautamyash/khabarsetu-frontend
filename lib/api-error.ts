import axios from "axios";

/**
 * Shared backend-error-to-Hindi-message translator for the new admin API
 * modules (categories-api.ts, articles-api.ts). Mirrors the pattern already
 * used in lib/auth-api.ts (AuthApiError) — kept as a separate class here
 * rather than reusing AuthApiError, since auth-api.ts is working Phase 2A
 * code that should not be touched.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number | null,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function toApiError(error: unknown, fallback = "कुछ गलत हो गया। कृपया पुनः प्रयास करें।"): ApiError {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const detail = (error.response.data as { detail?: string } | undefined)?.detail;
      return new ApiError(error.response.status, detail ?? fallback);
    }
    return new ApiError(null, "सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।");
  }
  return new ApiError(null, fallback);
}
