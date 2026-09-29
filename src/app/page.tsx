import Link from "next/link";
import { getSession } from "@/lib/auth";

const primaryButton =
  "rounded-full bg-foreground px-5 py-3 font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]";
const secondaryButton =
  "rounded-full border border-black/15 px-5 py-3 font-medium text-black transition-colors hover:bg-zinc-100 dark:border-white/20 dark:text-white dark:hover:bg-zinc-900";

export default async function Home() {
  const { user, profile } = await getSession();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-5xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Hello {user ? profile?.first_name || "there" : "World"}
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        {user ? `Signed in as ${user.email}` : "Sign in to see the members-only area."}
      </p>
      <div className="flex gap-3">
        <Link href="/jokes" className={secondaryButton}>
          View jokes →
        </Link>
        {user ? (
          <Link href="/dashboard" className={primaryButton}>
            Members area →
          </Link>
        ) : (
          <Link href="/login" className={primaryButton}>
            Sign in with Google
          </Link>
        )}
      </div>
    </div>
  );
}
