import { PageShell } from "@/components/page-shell";
import { requireProfile } from "@/lib/auth";
import { themeForToday } from "@/lib/captions";
import { CreateForm } from "./create-form";

export const metadata = { title: "Post a photo" };

export default async function CreatePage() {
  const { user } = await requireProfile();

  return (
    <PageShell
      title="Post a photo"
      subtitle={
        <>
          Today&apos;s theme is <strong>{themeForToday()}</strong>. Upload a photo and AI will write
          three captions for everyone to vote on.
        </>
      }
    >
      <CreateForm userId={user.id} />
    </PageShell>
  );
}
