import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams.toString();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  const dest = `${backendUrl}/app/callback${params ? `?${params}` : ""}`;
  return NextResponse.redirect(dest);
}
