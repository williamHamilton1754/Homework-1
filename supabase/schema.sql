-- Run this in the Supabase dashboard: SQL Editor → New query → Run.

create table if not exists public.jokes (
  id bigint generated always as identity primary key,
  setup text not null,
  punchline text not null,
  created_at timestamptz not null default now()
);

-- Allow anyone with the anon key to read (but not write) jokes.
alter table public.jokes enable row level security;

drop policy if exists "Jokes are publicly readable" on public.jokes;
create policy "Jokes are publicly readable"
  on public.jokes for select
  to anon, authenticated
  using (true);

insert into public.jokes (setup, punchline) values
  ('Why don''t scientists trust atoms?', 'Because they make up everything.'),
  ('Why did the developer go broke?', 'Because they used up all their cache.'),
  ('How do you comfort a JavaScript bug?', 'You console it.'),
  ('Why do programmers prefer dark mode?', 'Because light attracts bugs.'),
  ('What''s a database''s favorite snack?', 'Chips and queries.');
