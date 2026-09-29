import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

export function hasName(profile: Pick<Profile, "first_name" | "last_name"> | null) {
  return Boolean(profile?.first_name?.trim() && profile?.last_name?.trim());
}

// Returns the signed-in user and their profile, or nulls if signed out.
export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  return { supabase, user, profile };
}

// For protected pages: sends signed-out users to /login, and users who
// haven't entered their name yet to /welcome.
export async function requireProfile({ allowIncomplete = false } = {}) {
  const session = await getSession();

  if (!session.user) {
    redirect("/login");
  }
  if (!allowIncomplete && !hasName(session.profile)) {
    redirect("/welcome");
  }

  return { ...session, user: session.user };
}
