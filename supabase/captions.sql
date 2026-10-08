-- Week 4: AI captions + voting, with RLS on every table.
-- Run this in the Supabase dashboard: SQL Editor → New query → Run.

-- 1. Posts: a photo a user uploaded. The image itself lives in Storage.
create table if not exists public.posts (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  image_path text not null,
  image_url text not null,
  theme text,
  created_at timestamptz not null default now()
);

-- 2. Captions: AI generations for a post, with the exact prompt that made them.
create table if not exists public.captions (
  id bigint generated always as identity primary key,
  post_id bigint not null references public.posts (id) on delete cascade,
  created_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  content text not null,
  style text not null,
  prompt text not null,
  model text not null,
  upvotes integer not null default 0,
  downvotes integer not null default 0,
  created_at timestamptz not null default now()
);

-- 3. Votes: one row per user per caption. +1 = upvote, -1 = downvote.
create table if not exists public.caption_votes (
  id bigint generated always as identity primary key,
  caption_id bigint not null references public.captions (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  vote smallint not null check (vote in (-1, 1)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (caption_id, user_id)
);

create index if not exists captions_post_id_idx on public.captions (post_id);
create index if not exists posts_created_at_idx on public.posts (created_at desc);

-- 4. Keep upvote/downvote totals on captions in sync with caption_votes.
--    Runs as the table owner, so vote rows can stay private to each user
--    while everyone still sees the totals.
create or replace function public.sync_caption_vote_counts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target bigint := coalesce(new.caption_id, old.caption_id);
begin
  update public.captions c
  set upvotes = (select count(*) from public.caption_votes v where v.caption_id = target and v.vote = 1),
      downvotes = (select count(*) from public.caption_votes v where v.caption_id = target and v.vote = -1)
  where c.id = target;
  return null;
end;
$$;

drop trigger if exists caption_votes_sync on public.caption_votes;
create trigger caption_votes_sync
  after insert or update or delete on public.caption_votes
  for each row execute procedure public.sync_caption_vote_counts();

-- 5. Row Level Security: the strictest rules the app still works with.
alter table public.posts enable row level security;
alter table public.captions enable row level security;
alter table public.caption_votes enable row level security;
alter table public.jokes enable row level security;
alter table public.profiles enable row level security;

-- Posts: the feed is public; you can only create or delete your own.
drop policy if exists "Posts are publicly readable" on public.posts;
create policy "Posts are publicly readable"
  on public.posts for select to anon, authenticated using (true);

drop policy if exists "Users can create their own posts" on public.posts;
create policy "Users can create their own posts"
  on public.posts for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can delete their own posts" on public.posts;
create policy "Users can delete their own posts"
  on public.posts for delete to authenticated
  using (user_id = auth.uid());

-- Captions: public to read; only addable to your own posts; never editable
-- by users (vote totals are updated by the trigger above).
drop policy if exists "Captions are publicly readable" on public.captions;
create policy "Captions are publicly readable"
  on public.captions for select to anon, authenticated using (true);

drop policy if exists "Users can add captions to their own posts" on public.captions;
create policy "Users can add captions to their own posts"
  on public.captions for insert to authenticated
  with check (
    created_by = auth.uid()
    and exists (select 1 from public.posts p where p.id = post_id and p.user_id = auth.uid())
  );

-- Votes: signed-in users only, and only their own rows.
drop policy if exists "Users can read their own votes" on public.caption_votes;
create policy "Users can read their own votes"
  on public.caption_votes for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can cast their own votes" on public.caption_votes;
create policy "Users can cast their own votes"
  on public.caption_votes for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can change their own votes" on public.caption_votes;
create policy "Users can change their own votes"
  on public.caption_votes for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can remove their own votes" on public.caption_votes;
create policy "Users can remove their own votes"
  on public.caption_votes for delete to authenticated
  using (user_id = auth.uid());

-- Jokes: read-only for everyone (no insert/update/delete policies).
drop policy if exists "Jokes are publicly readable" on public.jokes;
create policy "Jokes are publicly readable"
  on public.jokes for select to anon, authenticated using (true);

-- Profiles: already limited to "your own row" by auth.sql. Users can't
-- insert or delete profiles directly; the auth.users trigger does that.

-- 6. Photo storage. Public bucket so images load by URL; users can only
--    write inside a folder named after their user id.
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do update set public = true;

drop policy if exists "Users can upload their own photos" on storage.objects;
create policy "Users can upload their own photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can read their own photos" on storage.objects;
create policy "Users can read their own photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
