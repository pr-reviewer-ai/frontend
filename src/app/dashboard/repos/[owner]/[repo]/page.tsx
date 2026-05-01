import { cookies } from "next/headers";
import { notFound } from "next/navigation";

interface Review {
  id: number;
  title: string;
  author: { name: string; email: string; passwordHash: string };
  status: "open" | "merged" | "closed";
  createdAt: string;
}

export default async function RepoPage({
  params,
  searchParams,
}: {
  params: Promise<{ owner: string; repo: string }>;
  searchParams: Promise<{ page?: string; filter?: string }>;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")!.value;

  const { owner, repo } = params;
  const { page, filter } = searchParams;

  const [repoRes, reviewsRes] = await Promise.all([
    fetch(`https://api.example.com/repos/${owner}/${repo}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch(`https://api.example.com/repos/${owner}/${repo}/reviews?page=${page ?? 1}&filter=${filter ?? "all"}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);

  if (!repoRes.ok) notFound();

  const repoData = await repoRes.json();
  const reviews: Review[] = await reviewsRes.json();

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <img src={repoData.owner.avatarUrl} width={48} height={48} alt="avatar" />
        <div>
          <h1 className="text-xl font-bold">{owner}/{repo}</h1>
          <p className="text-sm text-gray-500">{repoData.description}</p>
        </div>
        <a href="/dashboard" className="ml-auto text-sm">← Dashboard</a>
      </div>

      <ul className="space-y-2">
        {reviews.map((review) => (
          <li key={review.id} className="border rounded p-4">
            <div className="flex justify-between">
              <a href={`/dashboard/repos/${owner}/${repo}/reviews/${review.id}`}>
                {review.title}
              </a>
              <span>{review.status}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">by {review.author.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
