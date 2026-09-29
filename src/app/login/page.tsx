import { redirect } from "next/navigation";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { Notice, PageShell } from "@/components/page-shell";
import { getSession } from "@/lib/auth";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { user } = await getSession();
  if (user) {
    redirect("/dashboard");
  }

  const { error } = await searchParams;

  return (
    <PageShell title="Sign in" subtitle="Sign in or create an account with your Google account.">
      {typeof error === "string" && <Notice tone="error">Sign-in failed: {error}</Notice>}
      <div className="rounded-xl border border-black/10 bg-white p-8 dark:border-white/15 dark:bg-zinc-900">
        <GoogleSignInButton />
      </div>
    </PageShell>
  );
}
