import Link from "next/link";
import { connection } from "next/server";
import { getSupabase } from "@/lib/supabase";

type Joke = {
  id: number;
  setup: string;
  punchline: string;
  created_at: string;
};

export const metadata = {
  title: "Jokes",
};

export default async function JokesPage() {
  // Fetch fresh rows on every request instead of at build time.
  await connection();

  const { data: jokes, error } = await getSupabase()
    .from("jokes")
    .select("id, setup, punchline, created_at")
    .order("id");

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-2xl px-6 py-16">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Home
        </Link>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Jokes
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Rows from the <code>jokes</code> table in Supabase.
        </p>

        {error ? (
          <p className="mt-8 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            Could not load jokes: {error.message}
          </p>
        ) : jokes.length === 0 ? (
          <p className="mt-8 text-zinc-600 dark:text-zinc-400">No jokes yet.</p>
        ) : (
          <ul className="mt-8 flex flex-col gap-4">
            {(jokes as Joke[]).map((joke) => (
              <li
                key={joke.id}
                className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/15 dark:bg-zinc-900"
              >
                <p className="font-medium text-black dark:text-zinc-50">{joke.setup}</p>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">{joke.punchline}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
