import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { getSession } from "@/lib/auth";
import { getMyVotes, getPost } from "@/lib/posts";

export const metadata = { title: "Post" };

export default async function PostPage({ params }: PageProps<"/posts/[id]">) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) {
    notFound();
  }

  const { supabase, user } = await getSession();
  const post = await getPost(supabase, postId);
  if (!post) {
    notFound();
  }
  const myVotes = await getMyVotes(supabase, user?.id, [post]);

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-2xl px-4 py-10 sm:px-6">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          ← Back to the feed
        </Link>
        <div className="mt-4">
          <PostCard post={post} myVotes={myVotes} userId={user?.id} priority />
        </div>
        {!user && (
          <p className="mt-6 text-center text-zinc-600 dark:text-zinc-400">
            <Link href="/login" className="underline">
              Sign in
            </Link>{" "}
            to vote on these captions.
          </p>
        )}
      </main>
    </div>
  );
}
