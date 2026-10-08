"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { castVote } from "@/app/posts/actions";

type Counts = { vote: number; upvotes: number; downvotes: number };

// What the counts will look like after clicking, before the server answers.
function predict(current: Counts, value: 1 | -1): Counts {
  const next = { ...current };
  if (current.vote === 1) next.upvotes--;
  if (current.vote === -1) next.downvotes--;
  next.vote = current.vote === value ? 0 : value;
  if (next.vote === 1) next.upvotes++;
  if (next.vote === -1) next.downvotes++;
  return next;
}

export function VoteButtons({
  captionId,
  initial,
  signedIn,
}: {
  captionId: number;
  initial: Counts;
  signedIn: boolean;
}) {
  const [counts, setCounts] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const score = counts.upvotes - counts.downvotes;

  if (!signedIn) {
    return (
      <Link
        href="/login"
        title="Sign in to vote"
        className="flex min-w-14 flex-col items-center rounded-lg px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        <span className="text-base font-semibold text-black dark:text-white">{score}</span>
        sign in to vote
      </Link>
    );
  }

  function vote(value: 1 | -1) {
    const previous = counts;
    setCounts(predict(counts, value));
    setError(null);
    startTransition(async () => {
      const result = await castVote(captionId, value);
      if ("error" in result) {
        setCounts(previous);
        setError(result.error);
      } else {
        setCounts(result);
      }
    });
  }

  const arrow = (value: 1 | -1, active: boolean, label: string) => (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={pending}
      onClick={() => vote(value)}
      className={`rounded-md px-2 text-lg leading-none transition-colors disabled:opacity-60 ${
        active
          ? value === 1
            ? "text-orange-600 dark:text-orange-400"
            : "text-indigo-600 dark:text-indigo-400"
          : "text-zinc-400 hover:text-black dark:hover:text-white"
      }`}
    >
      {value === 1 ? "▲" : "▼"}
    </button>
  );

  return (
    <div className="flex min-w-14 flex-col items-center" title={error ?? undefined}>
      {arrow(1, counts.vote === 1, "Upvote")}
      <span className="text-sm font-semibold tabular-nums text-black dark:text-white">{score}</span>
      {arrow(-1, counts.vote === -1, "Downvote")}
      {error && <span className="mt-1 text-center text-xs text-red-600 dark:text-red-400">{error}</span>}
    </div>
  );
}
