import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api-error";
import { deleteMedia } from "@/lib/media-api";
import { getSessionToken } from "@/lib/session";

/**
 * DELETE /api/admin/media/[id] — proxies to DELETE /api/v1/media/{id}.
 * The backend is the authoritative check for both "does this exist" and
 * "is the caller allowed to delete" (ADMIN only — EDITOR gets a 403, which
 * surfaces here as an ApiError and is passed through as-is); this handler
 * only adds the session token.
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "प्रमाणीकरण आवश्यक है। कृपया पुनः लॉगिन करें।" }, { status: 401 });
  }

  try {
    await deleteMedia(token, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status ?? 502 });
    }
    return NextResponse.json({ message: "फोटो हटाई नहीं जा सकी।" }, { status: 500 });
  }
}
