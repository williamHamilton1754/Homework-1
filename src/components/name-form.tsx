const inputClass =
  "mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-black outline-none focus:border-black dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:focus:border-white";

export function NameForm({
  action,
  firstName,
  lastName,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  firstName: string;
  lastName: string;
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          First name
          <input
            name="first_name"
            defaultValue={firstName}
            required
            autoComplete="given-name"
            className={inputClass}
          />
        </label>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Last name
          <input
            name="last_name"
            defaultValue={lastName}
            required
            autoComplete="family-name"
            className={inputClass}
          />
        </label>
      </div>
      <button
        type="submit"
        className="self-start rounded-full bg-foreground px-5 py-2.5 font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        {submitLabel}
      </button>
    </form>
  );
}
