import { cache } from "react";
import { apiClient } from "@/lib/api-client";
import { toApiError } from "@/lib/api-error";
import type { AdminCategory, CategoryInput } from "@/types/category";

/**
 * Server-only wrappers around the backend's /categories endpoints. GET is
 * public (no token needed); mutations require a Bearer token from the
 * caller (Route Handlers read it from the session cookie — see
 * lib/session.ts — these functions never read cookies themselves, keeping
 * them decoupled from Next.js request context, same shape as auth-api.ts).
 */

interface CategoryApiShape {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  article_count: number;
  created_at: string;
  updated_at: string;
}

function mapCategory(raw: CategoryApiShape): AdminCategory {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    articleCount: raw.article_count,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

/**
 * Wrapped in React's `cache()` — same pattern as getAuthenticatedUser in
 * lib/session.ts — so that within a single request, every caller that
 * needs categories (the public Header, a page's own data loader, etc.)
 * shares one underlying network call instead of firing one each. This
 * only dedupes within one request/render pass; it never causes stale data
 * across separate requests (e.g. after creating/editing a category and
 * navigating again), same as the existing getAuthenticatedUser usage.
 */
export const listCategories = cache(async (): Promise<AdminCategory[]> => {
  try {
    const { data } = await apiClient.get<CategoryApiShape[]>("/categories");
    return data.map(mapCategory);
  } catch (error) {
    throw toApiError(error, "श्रेणियां लोड नहीं हो सकीं।");
  }
});

export async function getCategory(id: string): Promise<AdminCategory> {
  try {
    const { data } = await apiClient.get<CategoryApiShape>(`/categories/${id}`);
    return mapCategory(data);
  } catch (error) {
    throw toApiError(error, "श्रेणी लोड नहीं हो सकी।");
  }
}

export async function createCategory(token: string, input: CategoryInput): Promise<AdminCategory> {
  try {
    const { data } = await apiClient.post<CategoryApiShape>("/categories", input, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return mapCategory(data);
  } catch (error) {
    throw toApiError(error, "श्रेणी सहेजी नहीं जा सकी।");
  }
}

export async function updateCategory(
  token: string,
  id: string,
  input: CategoryInput
): Promise<AdminCategory> {
  try {
    const { data } = await apiClient.put<CategoryApiShape>(`/categories/${id}`, input, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return mapCategory(data);
  } catch (error) {
    throw toApiError(error, "श्रेणी सहेजी नहीं जा सकी।");
  }
}

export async function deleteCategory(token: string, id: string): Promise<void> {
  try {
    await apiClient.delete(`/categories/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    throw toApiError(error, "श्रेणी हटाई नहीं जा सकी।");
  }
}
