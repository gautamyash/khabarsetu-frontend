import type { Metadata } from "next";
import { MediaGrid } from "@/components/admin/MediaGrid";
import { Pagination } from "@/components/admin/Pagination";
import { listMedia } from "@/lib/media-api";
import { getAuthenticatedUser, getSessionToken } from "@/lib/session";

export const metadata: Metadata = {
  title: "मीडिया",
};

const PAGE_SIZE = 40;

function buildHref(search: string | undefined, page: number): string {
  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (page > 1) query.set("page", String(page));
  const qs = query.toString();
  return qs ? `/admin/media?${qs}` : "/admin/media";
}

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const [user, token] = await Promise.all([getAuthenticatedUser(), getSessionToken()]);
  const canDelete = user?.role === "admin";

  let result: Awaited<ReturnType<typeof listMedia>> | null = null;
  let loadError: string | null = null;

  try {
    if (!token) throw new Error("no session");
    result = await listMedia(token, { search, page, limit: PAGE_SIZE });
  } catch {
    loadError = "फोटो लोड नहीं हो सकीं। कृपया पृष्ठ को पुनः लोड करें।";
  }

  return (
    <div>
      <h1 className="font-serif-hi text-2xl font-bold text-ink-900">मीडिया</h1>
      <p className="mt-2 text-sm text-ink-600">अपलोड की गई फोटो यहां देखें और नई फोटो जोड़ें।</p>

      <form method="get" className="mt-6">
        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder="फोटो खोजें..."
          className="w-full rounded-sm border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:w-72"
        />
      </form>

      {loadError || !result ? (
        <p className="mt-6 rounded-md border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700">
          {loadError ?? "फोटो लोड नहीं हो सकीं।"}
        </p>
      ) : (
        <>
          <MediaGrid initialItems={result.items} canDelete={canDelete} limit={PAGE_SIZE} search={search} />
          {result.items.length > 0 && (
            <div className="mt-6">
              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                buildHref={(p) => buildHref(search, p)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
