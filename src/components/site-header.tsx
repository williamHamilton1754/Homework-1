import Link from "next/link";
import { signOut } from "@/app/actions";
import { Avatar } from "@/components/avatar";
import { getSession } from "@/lib/auth";

const linkClass = "text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white";

export async function SiteHeader() {
  const { user, profile } = await getSession();
  const displayName = profile?.first_name || user?.email || "";

  return (
    <header className="border-b border-black/10 bg-white dark:border-white/10 dark:bg-black">
      <nav className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3 sm:gap-5 sm:px-6">
        <Link href="/" className="font-semibold text-black dark:text-white">
          Caption the City
        </Link>
        {user && (
          <Link href="/create" className={linkClass}>
            Post
          </Link>
        )}
        {user && (
          <Link href="/dashboard" className={linkClass}>
            My stats
          </Link>
        )}

        <div className="ml-auto flex items-center gap-4">
          {user ? (
            <>
              <Link href="/profile" className="flex items-center gap-2">
                <Avatar url={profile?.avatar_url} name={displayName} size={28} />
                <span className={`${linkClass} hidden sm:inline`}>Profile</span>
              </Link>
              <form action={signOut}>
                <button type="submit" className={linkClass}>
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
