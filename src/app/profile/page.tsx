import { updateProfile } from "@/app/actions";
import { NameForm } from "@/components/name-form";
import { Notice, PageShell } from "@/components/page-shell";
import { requireProfile } from "@/lib/auth";
import { AvatarUploader } from "./avatar-uploader";

export const metadata = { title: "Profile" };

const cardClass =
  "rounded-xl border border-black/10 bg-white p-6 dark:border-white/15 dark:bg-zinc-900";
const headingClass = "mb-4 text-lg font-semibold text-black dark:text-zinc-50";

export default async function ProfilePage({ searchParams }: PageProps<"/profile">) {
  const { user, profile } = await requireProfile();
  const { saved, error } = await searchParams;
  const fullName = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();

  return (
    <PageShell title="Profile" subtitle={user.email}>
      {saved && <Notice tone="success">Your profile was saved.</Notice>}
      {typeof error === "string" && <Notice tone="error">{error}</Notice>}

      <div className="flex flex-col gap-6">
        <section className={cardClass}>
          <h2 className={headingClass}>Photo</h2>
          <AvatarUploader
            userId={user.id}
            avatarUrl={profile?.avatar_url ?? null}
            name={fullName || user.email || ""}
          />
        </section>

        <section className={cardClass}>
          <h2 className={headingClass}>Name</h2>
          <NameForm
            action={updateProfile}
            firstName={profile?.first_name ?? ""}
            lastName={profile?.last_name ?? ""}
            submitLabel="Save"
          />
        </section>
      </div>
    </PageShell>
  );
}
