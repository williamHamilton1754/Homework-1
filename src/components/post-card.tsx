import Image from "next/image";
import Link from "next/link";
import { STYLES, isStyleKey } from "@/lib/captions";
import type { Post } from "@/lib/posts";
import { VoteButtons } from "./vote-buttons";

function timeAgo(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function PostCard({
  post,
  myVotes,
  userId,
  priority = false,
}: {
  post: Post;
  myVotes: Record<number, number>;
  userId: string | undefined;
  priority?: boolean;
}) {
  const style = post.captions[0]?.style;
  const styleLabel = isStyleKey(style) ? STYLES[style].label : style;

  return (
    <article
      id={`post-${post.id}`}
      className="overflow-hidden rounded-xl border border-black/10 bg-white dark:border-white/15 dark:bg-zinc-900"
    >
      <Link href={`/posts/${post.id}`} className="relative block aspect-[4/3] bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={post.image_url}
          alt={post.captions[0]?.content ?? "Uploaded photo"}
          fill
          sizes="(max-width: 672px) 100vw, 672px"
          className="object-cover"
          priority={priority}
        />
      </Link>

      <div className="flex flex-wrap items-center gap-2 px-5 pt-4 text-xs text-zinc-500 dark:text-zinc-400">
        {post.theme && (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">#{post.theme}</span>
        )}
        {styleLabel && <span>in the voice of “{styleLabel}”</span>}
        <span>· {timeAgo(post.created_at)}</span>
        {post.user_id === userId && <span>· your post</span>}
      </div>

      <ol className="flex flex-col divide-y divide-black/5 px-3 py-2 dark:divide-white/10">
        {post.captions.map((caption) => (
          <li key={caption.id} className="flex items-center gap-3 py-2">
            <VoteButtons
              captionId={caption.id}
              signedIn={Boolean(userId)}
              initial={{
                vote: myVotes[caption.id] ?? 0,
                upvotes: caption.upvotes,
                downvotes: caption.downvotes,
              }}
            />
            <p className="text-[15px] text-black dark:text-zinc-100">{caption.content}</p>
          </li>
        ))}
      </ol>

      {post.captions[0] && (
        <details className="border-t border-black/5 px-5 py-3 text-xs text-zinc-500 dark:border-white/10 dark:text-zinc-400">
          <summary className="cursor-pointer select-none">
            See the AI prompt ({post.captions[0].model})
          </summary>
          <p className="mt-2 whitespace-pre-wrap font-mono">{post.captions[0].prompt}</p>
        </details>
      )}
    </article>
  );
}
