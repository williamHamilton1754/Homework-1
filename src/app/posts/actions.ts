"use server";

import { revalidatePath } from "next/cache";
import { buildPrompt, isStyleKey, themeForToday } from "@/lib/captions";
import { GEMINI_MODEL, generateCaptions } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";

const POSTS_PER_DAY = 10;

// Called after the browser has uploaded the photo to Storage. Asks Gemini
// for captions, then saves the post, the captions, and the prompt used.
export async function createPost(
  imagePath: string,
  style: string,
): Promise<{ postId: number } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Please sign in to create a post." };
  }
  if (!isStyleKey(style)) {
    return { error: "Please pick a caption style." };
  }
  if (!imagePath.startsWith(`${user.id}/`)) {
    return { error: "That photo doesn't belong to you." };
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", since);
  if ((count ?? 0) >= POSTS_PER_DAY) {
    return { error: `You can post ${POSTS_PER_DAY} photos a day. Come back tomorrow!` };
  }

  const { data: file, error: downloadError } = await supabase.storage
    .from("photos")
    .download(imagePath);
  if (downloadError || !file) {
    return { error: downloadError?.message ?? "Couldn't read the uploaded photo." };
  }

  const theme = themeForToday();
  const prompt = buildPrompt(style, theme);

  let captions: string[];
  try {
    captions = await generateCaptions({
      prompt,
      image: await file.arrayBuffer(),
      mimeType: file.type || "image/jpeg",
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Caption generation failed." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("photos").getPublicUrl(imagePath);

  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({ user_id: user.id, image_path: imagePath, image_url: publicUrl, theme })
    .select("id")
    .single();
  if (postError || !post) {
    return { error: postError?.message ?? "Couldn't save your post." };
  }

  const { error: captionError } = await supabase.from("captions").insert(
    captions.map((content) => ({
      post_id: post.id,
      created_by: user.id,
      content,
      style,
      prompt,
      model: GEMINI_MODEL,
    })),
  );
  if (captionError) {
    return { error: captionError.message };
  }

  revalidatePath("/");
  return { postId: post.id };
}

export type VoteResult =
  | { vote: -1 | 0 | 1; upvotes: number; downvotes: number }
  | { error: string };

// Clicking the same arrow twice removes your vote; the other arrow switches it.
export async function castVote(captionId: number, value: 1 | -1): Promise<VoteResult> {
  if (value !== 1 && value !== -1) {
    return { error: "Invalid vote." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sign in to vote." };
  }

  const { data: existing } = await supabase
    .from("caption_votes")
    .select("vote")
    .eq("caption_id", captionId)
    .eq("user_id", user.id)
    .maybeSingle<{ vote: number }>();

  const { error } =
    existing?.vote === value
      ? await supabase
          .from("caption_votes")
          .delete()
          .eq("caption_id", captionId)
          .eq("user_id", user.id)
      : await supabase.from("caption_votes").upsert(
          {
            caption_id: captionId,
            user_id: user.id,
            vote: value,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "caption_id,user_id" },
        );
  if (error) {
    return { error: error.message };
  }

  const { data: caption } = await supabase
    .from("captions")
    .select("upvotes, downvotes")
    .eq("id", captionId)
    .single<{ upvotes: number; downvotes: number }>();

  revalidatePath("/");
  return {
    vote: existing?.vote === value ? 0 : value,
    upvotes: caption?.upvotes ?? 0,
    downvotes: caption?.downvotes ?? 0,
  };
}
