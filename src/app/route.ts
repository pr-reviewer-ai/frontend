import { readFile } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (token) {
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Cookie: `token=${token.value}` },
        cache: "no-store",
      });
      if (res.ok) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch {
      // backend unreachable — fall through to landing
    }
  }

  const html = await readFile(
    path.join(process.cwd(), "public/landing.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
