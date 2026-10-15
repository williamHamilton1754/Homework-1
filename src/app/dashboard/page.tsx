import Image from "next/image";
import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { PageShell } from "@/components/page-shell";
import { requireProfile } from "@/lib/auth";
import { getFeed, leaderId, score, type Caption } from "@/lib/posts";

export const metadata = { title: "My stats" };

const card = "rounded-xl border border-black/10 bg-white p-5 dark:border-white/15 dark:bg-zinc-900";

// Signed-in only: signed-out visitors are redirected to /login.
export default async function StatsPage() {
  const { supabase, user, profile } = await requireProfile();
  const fullName = `${profile?.first_name} ${profile?.last_name}`;

  const [myPosts, votesCast, myCaptions, feed] = await Promise.all([
    supabase
      .from("posts")
      .select("id, image_url, created_at", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("caption_votes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase
      .from("captions")
      .select("id, post_id, content, upvotes, downvotes")
      .eq("created_by", user.id)
      .eq("source", "human"),
    getFeed(supabase, "top"),
  ]);

  const humanCaptions = (myCaptions.data ?? []) as Pick<Caption, "id" | "content" | "upvotes" | "downvotes">[];
  const best = [...humanCaptions].sort((a, b) => score(b) - score(a))[0];

  // Human vs AI: who holds the 👑 across posts that have a clear winner.
  let humanWins = 0;
  let aiWins = 0;
  for (const post of feed.posts) {
    const winner = post.captions.find((c) => c.id === leaderId(post));
    if (winner?.source === "human") humanWins++;
    if (winner?.source === "ai") aiWins++;
  }

  const stats = [
    { label: "Photos posted", value: myPosts.count ?? 0 },
    { label: "Votes cast", value: votesCast.count ?? 0 },
    { label: "Captions written", value: humanCaptions.length },
  ];

  return (
    <PageShell title="My stats">
      <div className={`flex items-center gap-4 ${card}`}>
        <Avatar url={profile?.avatar_url} name={fullName} size={56} />
        <div>
          <p className="text-lg font-semibold text-black dark:text-zinc-50">{fullName}</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{user.email}</p>
        </div>
        <Link href="/profile" className="ml-auto text-sm text-zinc-600 underline dark:text-zinc-400">
          Edit profile
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className={`${card} text-center`}>
            <p className="text-3xl font-semibold tabular-nums text-black dark:text-white">{s.value}</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className={`mt-4 ${card}`}>
        <p className="font-medium text-black dark:text-white">Humans vs AI</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Who holds the 👑 on each post right now</p>
        <div className="mt-3 flex items-center gap-3 text-sm font-medium">
          <span className="text-emerald-700 dark:text-emerald-300">Humans {humanWins}</span>
          <div className="flex h-3 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            {humanWins + aiWins > 0 && (
              <div
                className="bg-emerald-500"
                style={{ width: `${(humanWins / (humanWins + aiWins)) * 100}%` }}
              />
            )}
            {aiWins > 0 && <div className="flex-1 bg-indigo-500" />}
          </div>
          <span className="text-indigo-700 dark:text-indigo-300">AI {aiWins}</span>
        </div>
      </div>

      {best && (
        <div className={`mt-4 ${card}`}>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Your best caption ({score(best)} points)</p>
          <p className="mt-1 text-black dark:text-white">“{best.content}”</p>
        </div>
      )}

      <h2 className="mt-8 mb-3 font-medium text-black dark:text-white">Your photos</h2>
      {(myPosts.data ?? []).length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          You haven&apos;t posted yet.{" "}
          <Link href="/create" className="font-medium text-black underline dark:text-white">
            Post your first photo
          </Link>
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {(myPosts.data ?? []).map((p) => (
            <Link
              key={p.id}
              href={`/posts/${p.id}`}
              className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800"
            >
              <Image src={p.image_url} alt="Your post" fill sizes="220px" className="object-cover" />
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
