/**
 * Admin-facing media type (real API data, snake_case backend fields mapped
 * to camelCase) — used by the /admin/media grid and the featured-image
 * picker in the news form.
 */
export interface AdminMedia {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}
