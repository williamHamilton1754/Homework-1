"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Avatar } from "@/components/avatar";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 5 * 1024 * 1024;

// Uploads the photo to Supabase Storage and saves only its URL in the database.
export function AvatarUploader({
  userId,
  avatarUrl,
  name,
}: {
  userId: string;
  avatarUrl: string | null;
  name: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ tone: "error" | "info"; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setStatus({ tone: "error", text: "Please choose an image file." });
      return;
    }
    if (file.size > MAX_BYTES) {
      setStatus({ tone: "error", text: "Please choose an image under 5 MB." });
      return;
    }

    setUploading(true);
    setStatus({ tone: "info", text: "Uploading…" });

    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { contentType: file.type });

    if (uploadError) {
      setStatus({ tone: "error", text: uploadError.message });
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", userId);

    setUploading(false);
    if (updateError) {
      setStatus({ tone: "error", text: updateError.message });
      return;
    }

    setStatus({ tone: "info", text: "Photo updated." });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-5">
      <Avatar url={avatarUrl} name={name} size={80} />
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleFile(file);
            event.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="self-start rounded-full border border-black/15 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-100 disabled:opacity-60 dark:border-white/20 dark:text-white dark:hover:bg-zinc-800"
        >
          {avatarUrl ? "Change photo" : "Upload photo"}
        </button>
        {status && (
          <p
            className={`text-sm ${status.tone === "error" ? "text-red-600 dark:text-red-400" : "text-zinc-600 dark:text-zinc-400"}`}
          >
            {status.text}
          </p>
        )}
      </div>
    </div>
  );
}
