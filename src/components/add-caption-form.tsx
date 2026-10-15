"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addCaption } from "@/app/posts/actions";

const MAX = 140;

export function AddCaptionForm({ postId, signedIn }: { postId: number; signedIn: boolean }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!signedIn) {
    return (
      <p className="px-5 py-3 text-sm text-zinc-500 dark:text-zinc-400">
        Think you&apos;re funnier than the AI?{" "}
        <Link href="/login" className="font-medium text-black underline dark:text-white">
          Sign in
        </Link>{" "}
        to add your own caption.
      </p>
    );
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await addCaption(postId, text);
      if ("error" in result) {
        setError(result.error);
      } else {
        setText("");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={submit} className="px-5 py-3">
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX}
          disabled={pending}
          placeholder="Funnier than the AI? Add your caption…"
          aria-label="Your caption"
          className="min-w-0 flex-1 rounded-full border border-black/15 bg-transparent px-4 py-2 text-sm text-black outline-none focus:border-black dark:border-white/20 dark:text-white dark:focus:border-white"
        />
        <button
          type="submit"
          disabled={pending || text.trim() === ""}
          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-40"
        >
          {pending ? "Adding…" : "Add"}
        </button>
      </div>
      <div className="mt-1 flex justify-between px-2 text-xs text-zinc-500">
        <span className="text-red-600 dark:text-red-400">{error}</span>
        {text.length > MAX - 30 && <span>{MAX - text.length} left</span>}
      </div>
    </form>
  );
}
