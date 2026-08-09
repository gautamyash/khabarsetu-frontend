import { apiClient, apiClientMultipart } from "@/lib/api-client";
import { toApiError } from "@/lib/api-error";
import type { AdminMedia } from "@/types/media";
import type { Page } from "@/types/pagination";

/**
 * Server-only wrappers around the backend's /media endpoints. Both require
 * a Bearer token (there is no public media API in this phase) — Route
 * Handlers pass the token in, same pattern as articles-api.ts/
 * categories-api.ts.
 */

interface MediaApiShape {
  id: string;
  filename: string;
  url: string;
  mime_type: string;
  size: number;
  created_at: string;
}

interface PageApiShape<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

function mapMedia(raw: MediaApiShape): AdminMedia {
  return {
    id: raw.id,
    filename: raw.filename,
    url: raw.url,
    mimeType: raw.mime_type,
    size: raw.size,
    createdAt: raw.created_at,
  };
}

/**
 * Uploads a single image. `file` is a standard Web File — in the Route
 * Handler that calls this, it comes straight out of `request.formData()`,
 * so it's re-wrapped in a fresh FormData here rather than re-parsed.
 */
export async function uploadMedia(token: string, file: File): Promise<AdminMedia> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClientMultipart.post<MediaApiShape>("/media/upload", formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return mapMedia(data);
  } catch (error) {
    throw toApiError(error, "फोटो अपलोड नहीं हो सकी।");
  }
}

export async function listMedia(
  token: string,
  params: { search?: string; page?: number; limit?: number } = {}
): Promise<Page<AdminMedia>> {
  try {
    const { data } = await apiClient.get<PageApiShape<MediaApiShape>>("/media", {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        search: params.search || undefined,
        page: params.page ?? 1,
        limit: params.limit ?? 40,
      },
    });
    return {
      items: data.items.map(mapMedia),
      page: data.page,
      limit: data.limit,
      total: data.total,
      totalPages: data.total_pages,
    };
  } catch (error) {
    throw toApiError(error, "फोटो लोड नहीं हो सकीं।");
  }
}

/** ADMIN only — the backend (require_admin on DELETE /media/{id}) is the
 * authoritative check; this just surfaces its 403 as a normal ApiError. */
export async function deleteMedia(token: string, id: string): Promise<void> {
  try {
    await apiClient.delete(`/media/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    throw toApiError(error, "फोटो हटाई नहीं जा सकी।");
  }
}
