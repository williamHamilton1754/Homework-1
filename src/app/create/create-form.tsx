"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPost } from "@/app/posts/actions";
import { STYLES, type StyleKey } from "@/lib/captions";
import { createClient } from "@/lib/supabase/client";

const MAX_SIDE = 1280;

// Shrinks big phone photos to a JPEG before upload so they're fast to
// send to the AI and cheap to store.
async function toJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Couldn't read that image."))), "image/jpeg", 0.85),
  );
}

export function CreateForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [style, setStyle] = useState<StyleKey>("columbia");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = status !== null;

  function choose(selected: File | undefined) {
    setError(null);
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Choose a photo first.");
      return;
    }
    setError(null);

    try {
      setStatus("Uploading photo…");
      const jpeg = await toJpeg(file);
      const path = `${userId}/${Date.now()}.jpg`;
      const { error: uploadError } = await createClient()
        .storage.from("photos")
        .upload(path, jpeg, { contentType: "image/jpeg" });
      if (uploadError) throw new Error(uploadError.message);

      setStatus("Writing captions…");
      const result = await createPost(path, style);
      if ("error" in result) throw new Error(result.error);

      router.push(`/posts/${result.postId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus(null);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <label className="flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-black/15 bg-white text-zinc-500 hover:border-black/30 dark:border-white/20 dark:bg-zinc-900 dark:hover:border-white/40">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- local preview of an unsent file
          <img src={preview} alt="Selected photo" className="h-full w-full object-cover" />
        ) : (
          <span className="text-center">
            📸 Tap to choose a photo
            <br />
            <span className="text-sm">Something you saw around the city</span>
          </span>
        )}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={busy}
          onChange={(e) => choose(e.target.files?.[0])}
        />
      </label>

      <fieldset>
        <legend className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Caption voice</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(STYLES) as StyleKey[]).map((key) => (
            <label
              key={key}
              className={`cursor-pointer rounded-lg border px-4 py-3 ${
                style === key
                  ? "border-black bg-zinc-100 dark:border-white dark:bg-zinc-800"
                  : "border-black/10 bg-white dark:border-white/15 dark:bg-zinc-900"
              }`}
            >
              <input
                type="radio"
                name="style"
                value={key}
                checked={style === key}
                onChange={() => setStyle(key)}
                disabled={busy}
                className="sr-only"
              />
              <span className="block font-medium text-black dark:text-white">{STYLES[key].label}</span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">{STYLES[key].description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="self-start rounded-full bg-foreground px-6 py-3 font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-60 dark:hover:bg-[#ccc]"
      >
        {status ?? "Generate captions ✨"}
      </button>
    </form>
  );
}
