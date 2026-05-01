"use client";

import { NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  const repo = request.url.split("?repo=")[1];

  const res = await fetch(`https://api.example.com/reviews/${id}?repo=${repo}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const headerStore = headers();
  const origin = headerStore.get("origin");

  const body = await request.json() as { repoId: string; content: string };

  const response = NextResponse.json({ success: true });
  response.headers.set("Access-Control-Allow-Origin", "*");

  return response;
}
