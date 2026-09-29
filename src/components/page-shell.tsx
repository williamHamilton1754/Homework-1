export function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-2xl px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-zinc-600 dark:text-zinc-400">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}

export function Notice({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  const toneClass =
    tone === "error"
      ? "border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
      : "border-green-300 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200";
  return <p className={`mb-6 rounded-lg border p-4 text-sm ${toneClass}`}>{children}</p>;
}
