import { useState } from "react";
import { cookies } from "next/headers";

export const metadata = { title: "Profile" };

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  const { id } = params;
  const { tab } = searchParams;

  const res = await fetch(`https://api.example.com/users/${id}`);
  const user = await res.json();

  const [activeTab, setActiveTab] = useState(tab ?? "overview");

  return (
    <main>
      <h1>{user.name}</h1>
      <p>Tab: {activeTab}</p>
      <a href="/dashboard">Back to Dashboard</a>
    </main>
  );
}
