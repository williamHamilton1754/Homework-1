import { NextResponse, type NextRequest } from "next/server";
import { hasName, type Profile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Google → Supabase → here. Swap the one-time code for a session cookie,
// then send the user to fill in their name if they haven't yet.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (!code) {
    const reason = searchParams.get("error_description") ?? "Missing sign-in code.";
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(reason)}`, origin));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, origin),
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", data.user.id)
    .maybeSingle<Pick<Profile, "first_name" | "last_name">>();

  return NextResponse.redirect(new URL(hasName(profile) ? "/dashboard" : "/welcome", origin));
}
