import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api-error";
import { listMedia, uploadMedia } from "@/lib/media-api";
import { getSessionToken } from "@/lib/session";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * GET /api/admin/media — proxies to GET /api/v1/media. Used by the
 * /admin/media grid and the NewsForm featured-image picker.
 */
export async function GET(request: Request) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "प्रमाणीकरण आवश्यक है। कृपया पुनः लॉगिन करें।" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const search = searchParams.get("search")?.trim() || undefined;

  try {
    const result = await listMedia(token, { search, page });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status ?? 502 });
    }
    return NextResponse.json({ message: "फोटो लोड नहीं हो सकीं।" }, { status: 500 });
  }
}

/**
 * POST /api/admin/media — proxies to POST /api/v1/media/upload. Reads the
 * file straight out of the incoming multipart form; the pre-checks here
 * (type/size) exist only to avoid an unnecessary round trip for an
 * obviously-wrong file — the backend's Pillow-based check remains the
 * actual authority (see media_service.validate_and_identify).
 */
export async function POST(request: Request) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "प्रमाणीकरण आवश्यक है। कृपया पुनः लॉगिन करें।" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ message: "अमान्य अनुरोध।" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ message: "कृपया एक फोटो चुनें।" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { message: "कृपया केवल JPG, PNG या WEBP फोटो अपलोड करें।" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ message: "फ़ाइल का आकार सीमा से बड़ा है।" }, { status: 400 });
  }

  try {
    const media = await uploadMedia(token, file);
    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status ?? 502 });
    }
    return NextResponse.json({ message: "फोटो अपलोड नहीं हो सकी।" }, { status: 500 });
  }
}
