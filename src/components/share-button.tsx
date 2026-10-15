"use client";

import { useState } from "react";

export function ShareButton({ postId, text }: { postId: number; text: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/posts/${postId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Caption the City", text, url });
        return;
      } catch {
        // User closed the share sheet; fall through to copying the link.
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={share}
      className="rounded-full px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
    >
      {copied ? "✓ Link copied" : "↗ Share"}
    </button>
  );
}
