import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { PageShell } from "@/components/page-shell";
import { requireProfile } from "@/lib/auth";

export const metadata = { title: "Members" };

// Members-only route: signed-out visitors are redirected to /login.
export default async function DashboardPage() {
  const { user, profile } = await requireProfile();
  const fullName = `${profile?.first_name} ${profile?.last_name}`;
  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <PageShell title="Members only" subtitle="You can only see this page because you're signed in.">
      <div className="flex items-center gap-5 rounded-xl border border-black/10 bg-white p-6 dark:border-white/15 dark:bg-zinc-900">
        <Avatar url={profile?.avatar_url} name={fullName} size={64} />
        <div>
          <p className="text-xl font-semibold text-black dark:text-zinc-50">
            Welcome back, {profile?.first_name}!
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {user.email} · member since {memberSince}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-black/15 p-6 dark:border-white/20">
        <p className="font-medium text-black dark:text-zinc-50">🔒 Members-only joke</p>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Why did the user get locked out of the members area?
        </p>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          They forgot to bring their session cookie.
        </p>
      </div>

      <Link
        href="/profile"
        className="mt-6 inline-block text-sm text-zinc-600 underline hover:text-black dark:text-zinc-400 dark:hover:text-white"
      >
        Edit your profile →
      </Link>
    </PageShell>
  );
}
