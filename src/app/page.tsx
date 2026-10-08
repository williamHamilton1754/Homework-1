import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { getSession } from "@/lib/auth";
import { themeForToday } from "@/lib/captions";
import { getFeed, getMyVotes, type Sort } from "@/lib/posts";

const SORTS: { key: Sort; label: string }[] = [
  { key: "hot", label: "🔥 Hot today" },
  { key: "new", label: "New" },
  { key: "top", label: "Top" },
];

const primaryButton =
  "rounded-full bg-foreground px-5 py-2.5 font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]";

export default async function Home({ searchParams }: PageProps<"/">) {
  const { sort: sortParam } = await searchParams;
  const sort: Sort = SORTS.some((s) => s.key === sortParam) ? (sortParam as Sort) : "hot";

  const { supabase, user, profile } = await getSession();
  const { posts, error } = await getFeed(supabase, sort);
  const myVotes = await getMyVotes(supabase, user?.id, posts);
  const theme = themeForToday();

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-2xl px-4 py-10 sm:px-6">
        <section className="rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 p-6 dark:from-sky-950 dark:to-indigo-950">
          <p className="text-sm font-medium uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
            Today&apos;s theme
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-black dark:text-white">
            {theme}
          </h1>
          <p className="mt-2 text-zinc-700 dark:text-zinc-300">
            {user
              ? `Hey ${profile?.first_name ?? "there"}! Snap something around the city, let AI caption it, and vote on the funniest ones.`
              : "Columbia's photos of New York, captioned by AI and ranked by you. Sign in to post and vote."}
          </p>
          <div className="mt-4">
            {user ? (
              <Link href="/create" className={primaryButton}>
                Post a photo
              </Link>
            ) : (
              <Link href="/login" className={primaryButton}>
                Sign in with Google
              </Link>
            )}
          </div>
        </section>

        <nav className="mt-8 flex gap-2">
          {SORTS.map((s) => (
            <Link
              key={s.key}
              href={s.key === "hot" ? "/" : `/?sort=${s.key}`}
              className={`rounded-full px-4 py-1.5 text-sm ${
                sort === s.key
                  ? "bg-foreground text-background"
                  : "text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 flex flex-col gap-6">
          {error && <p className="text-red-600 dark:text-red-400">Could not load posts: {error.message}</p>}
          {!error && posts.length === 0 && (
            <p className="rounded-xl border border-dashed border-black/15 p-8 text-center text-zinc-600 dark:border-white/20 dark:text-zinc-400">
              {sort === "hot" ? "Nothing posted in the last 24 hours. " : "No posts yet. "}
              {user ? (
                <Link href="/create" className="underline">
                  Be the first!
                </Link>
              ) : (
                "Sign in and be the first!"
              )}
            </p>
          )}
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} myVotes={myVotes} userId={user?.id} priority={i === 0} />
          ))}
        </div>
      </main>
    </div>
  );
}
