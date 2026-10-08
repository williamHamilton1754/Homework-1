import type { SupabaseClient } from "@supabase/supabase-js";

export type Caption = {
  id: number;
  content: string;
  style: string;
  prompt: string;
  model: string;
  upvotes: number;
  downvotes: number;
};

export type Post = {
  id: number;
  user_id: string;
  image_url: string;
  theme: string | null;
  created_at: string;
  captions: Caption[];
};

export type Sort = "hot" | "new" | "top";

const POST_COLUMNS =
  "id, user_id, image_url, theme, created_at, captions(id, content, style, prompt, model, upvotes, downvotes)";

const score = (c: Caption) => c.upvotes - c.downvotes;
const bestScore = (p: Post) => Math.max(0, ...p.captions.map(score));

function sortCaptions(post: Post): Post {
  return { ...post, captions: [...post.captions].sort((a, b) => score(b) - score(a) || a.id - b.id) };
}

export async function getFeed(supabase: SupabaseClient, sort: Sort) {
  let query = supabase.from("posts").select(POST_COLUMNS).order("created_at", { ascending: false });

  if (sort === "hot") {
    // Hot = posted in the last 24 hours, ranked by its best caption.
    query = query.gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  }

  const { data, error } = await query.limit(sort === "new" ? 30 : 100);
  const posts = ((data ?? []) as Post[]).map(sortCaptions);

  if (sort !== "new") {
    posts.sort((a, b) => bestScore(b) - bestScore(a) || b.created_at.localeCompare(a.created_at));
  }
  return { posts: posts.slice(0, 30), error };
}

export async function getPost(supabase: SupabaseClient, id: number) {
  const { data } = await supabase.from("posts").select(POST_COLUMNS).eq("id", id).maybeSingle();
  return data ? sortCaptions(data as Post) : null;
}

// The signed-in user's own votes (RLS only ever returns their rows).
export async function getMyVotes(supabase: SupabaseClient, userId: string | undefined, posts: Post[]) {
  const captionIds = posts.flatMap((p) => p.captions.map((c) => c.id));
  if (!userId || captionIds.length === 0) {
    return {};
  }

  const { data } = await supabase
    .from("caption_votes")
    .select("caption_id, vote")
    .eq("user_id", userId)
    .in("caption_id", captionIds);

  return Object.fromEntries((data ?? []).map((v) => [v.caption_id, v.vote])) as Record<number, number>;
}
