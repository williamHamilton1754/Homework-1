import { redirect } from "next/navigation";
import { completeWelcome } from "@/app/actions";
import { NameForm } from "@/components/name-form";
import { Notice, PageShell } from "@/components/page-shell";
import { hasName, requireProfile } from "@/lib/auth";

export const metadata = { title: "Welcome" };

// Shown after sign-in whenever the profile is missing a first or last name.
export default async function WelcomePage({ searchParams }: PageProps<"/welcome">) {
  const { user, profile } = await requireProfile({ allowIncomplete: true });
  if (hasName(profile)) {
    redirect("/dashboard");
  }

  const { error } = await searchParams;
  // Suggest the names Google gave us, but let the user confirm them.
  const meta = user.user_metadata ?? {};

  return (
    <PageShell
      title="Welcome! 👋"
      subtitle="Before you continue, tell us your name. You can change it later on your profile."
    >
      {typeof error === "string" && <Notice tone="error">{error}</Notice>}
      <div className="rounded-xl border border-black/10 bg-white p-6 dark:border-white/15 dark:bg-zinc-900">
        <NameForm
          action={completeWelcome}
          firstName={profile?.first_name ?? meta.given_name ?? ""}
          lastName={profile?.last_name ?? meta.family_name ?? ""}
          submitLabel="Continue"
        />
      </div>
    </PageShell>
  );
}
