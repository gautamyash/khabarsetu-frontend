import { NextResponse } from "next/server";
import { AuthApiError, login } from "@/lib/auth-api";
import { setSessionCookie } from "@/lib/session";

/**
 * POST /api/auth/login
 *
 * Acts as a thin server-side proxy in front of the FastAPI backend: it
 * calls POST /api/v1/auth/login, then stores the returned JWT in an
 * httpOnly cookie instead of handing it back to the browser. The client
 * only ever receives `{ user }` — never the token itself.
 */
export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "अमान्य अनुरोध।" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { message: "कृपया ईमेल और पासवर्ड दर्ज करें।" },
      { status: 400 }
    );
  }

  try {
    const { accessToken, user } = await login(email, password);
    await setSessionCookie(accessToken);
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof AuthApiError) {
      const status = error.status === 401 ? 401 : (error.status ?? 502);
      return NextResponse.json({ message: error.message }, { status });
    }
    return NextResponse.json({ message: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।" }, { status: 500 });
  }
}
