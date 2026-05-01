"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ highlight?: string }>;
}) {
  const cookieStore = cookies();
  const headerStore = headers();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/");

  const { section } = params;
  const { highlight } = searchParams;

  const res = await fetch(`https://api.example.com/settings/${section}`);
  const settings = await res.json();

  return (
    <main>
      <h2>{settings.title}</h2>
      <p>Highlight: {highlight}</p>
      <a href="/dashboard">Back</a>
    </main>
  );
}
