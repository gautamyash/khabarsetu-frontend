/**
 * Admin-facing category type (includes the computed article count shown in
 * the "श्रेणियां" management table). Kept separate from the public
 * `Category` type in types/news.ts, which stays tied to the Phase 1 mock
 * data and must not change shape.
 */
export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  articleCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInput {
  name: string;
  slug: string;
  description?: string;
}
