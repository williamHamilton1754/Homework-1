import Image from "next/image";
import Link from "next/link";
import { STYLES, isStyleKey } from "@/lib/captions";
import { leaderId, type Post } from "@/lib/posts";
import { AddCaptionForm } from "./add-caption-form";
import { ShareButton } from "./share-button";
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
  const aiCaption = post.captions.find((c) => c.source === "ai");
  const style = aiCaption?.style;
  const styleLabel = isStyleKey(style) ? STYLES[style].label : style;
  const leader = leaderId(post);

  return (
    <article
      id={`post-${post.id}`}
      className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm dark:border-white/15 dark:bg-zinc-900"
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
        {styleLabel && <span>AI voice: “{styleLabel}”</span>}
        <span>· {timeAgo(post.created_at)}</span>
        {post.user_id === userId && <span>· your post</span>}
        <span className="ml-auto">
          <ShareButton postId={post.id} text={post.captions[0]?.content ?? "Caption the City"} />
        </span>
      </div>

      <ol className="flex flex-col divide-y divide-black/5 px-3 py-2 dark:divide-white/10">
        {post.captions.map((caption) => {
          const isLeader = caption.id === leader;
          const isMine = caption.source === "human" && caption.created_by === userId;
          return (
            <li
              key={caption.id}
              className={`flex items-center gap-3 rounded-xl px-1 py-2 ${isLeader ? "bg-amber-50 dark:bg-amber-950/40" : ""}`}
            >
              <VoteButtons
                captionId={caption.id}
                signedIn={Boolean(userId)}
                initial={{
                  vote: myVotes[caption.id] ?? 0,
                  upvotes: caption.upvotes,
                  downvotes: caption.downvotes,
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] text-black dark:text-zinc-100">
                  {isLeader && <span title="Top caption">👑 </span>}
                  {caption.content}
                </p>
                <p className="mt-1 text-xs">
                  {caption.source === "ai" ? (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      AI
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {isMine ? "Human · you" : "Human"}
                    </span>
                  )}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="border-t border-black/5 dark:border-white/10">
        <AddCaptionForm postId={post.id} signedIn={Boolean(userId)} />
      </div>

      {aiCaption?.prompt && (
        <details className="border-t border-black/5 px-5 py-3 text-xs text-zinc-500 dark:border-white/10 dark:text-zinc-400">
          <summary className="cursor-pointer select-none">See the AI prompt ({aiCaption.model})</summary>
          <p className="mt-2 whitespace-pre-wrap font-mono">{aiCaption.prompt}</p>
        </details>
      )}
    </article>
  );
}
