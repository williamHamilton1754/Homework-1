import { PageShell } from "@/components/page-shell";

export const metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <PageShell title="Privacy policy" subtitle="A class project for COMS W1002 at Columbia.">
      <div className="flex flex-col gap-4 text-zinc-700 dark:text-zinc-300">
        <p>
          When you sign in with Google, we receive your name, email address, and Google account id.
          We store your email, the first and last name you enter, and any profile photo you upload.
        </p>
        <p>
          This data is stored in Supabase and is used only to show your profile inside this app. It
          is never sold or shared with anyone else.
        </p>
        <p>
          To have your data deleted, email{" "}
          <a href="mailto:wwh2125@columbia.edu" className="underline">
            wwh2125@columbia.edu
          </a>
          .
        </p>
      </div>
    </PageShell>
  );
}
