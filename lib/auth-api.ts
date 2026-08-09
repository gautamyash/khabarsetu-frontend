import axios from "axios";
import { apiClient } from "@/lib/api-client";
import type { AuthUser } from "@/types/auth";

/**
 * Thin wrappers around the backend's /auth endpoints. Server-only — these
 * are called from Next.js Route Handlers (app/api/auth/*), never imported
 * into Client Components. The access token they return is handed straight
 * to lib/session.ts to become an httpOnly cookie; it never reaches the
 * browser as readable JavaScript state.
 */

export interface LoginResult {
  accessToken: string;
  user: AuthUser;
}

/** Structured error so callers can show the right Hindi message per status. */
export class AuthApiError extends Error {
  constructor(
    public readonly status: number | null,
    message: string
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

function backendErrorMessage(error: unknown): AuthApiError {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const detail = (error.response.data as { detail?: string } | undefined)?.detail;
      return new AuthApiError(error.response.status, detail ?? "अनुरोध पूरा नहीं हो सका।");
    }
    // Request was made but no response came back — network/API down.
    return new AuthApiError(null, "सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।");
  }
  return new AuthApiError(null, "कुछ गलत हो गया। कृपया पुनः प्रयास करें।");
}

/** Exchanges credentials for an access token + user. Throws AuthApiError on failure. */
export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    const { data } = await apiClient.post("/auth/login", { email, password });
    return { accessToken: data.access_token, user: data.user as AuthUser };
  } catch (error) {
    throw backendErrorMessage(error);
  }
}

/** Resolves the user for a given access token. Returns null if the token is invalid/expired. */
export async function getCurrentUser(accessToken: string): Promise<AuthUser | null> {
  try {
    const { data } = await apiClient.get<AuthUser>("/auth/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return data;
  } catch {
    return null;
  }
}
