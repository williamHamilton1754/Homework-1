import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-5xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Hello World
      </h1>
      <Link
        href="/jokes"
        className="rounded-full bg-foreground px-5 py-3 font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        View jokes →
      </Link>
    </div>
  );
}
