import { NextRequest, NextResponse } from "next/server";
import { env } from "next-runtime-env";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams.toString();
  const backendUrl = env("NEXT_PUBLIC_API_URL") ?? "http://localhost:3001";
  const dest = `${backendUrl}/app/callback${params ? `?${params}` : ""}`;
  return NextResponse.redirect(dest);
}
