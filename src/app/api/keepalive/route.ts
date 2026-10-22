import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase's free plan pauses a database after a week with no requests,
// which takes the whole site down. A Vercel Cron job (vercel.json) calls
// this once a day so the database always has recent activity.
export async function GET() {
  const supabase = await createClient();
  const { count, error } = await supabase.from("jokes").select("id", { count: "exact", head: true });

  if (error) {
    console.error("Keep-alive query failed", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, jokes: count, at: new Date().toISOString() });
}
