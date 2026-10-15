-- Week 5: let people write their own captions to compete with the AI.
-- Run this in the Supabase dashboard: SQL Editor → New query → Run.

-- Every caption is now either 'ai' or 'human'. Human captions have no prompt/model/style.
alter table public.captions add column if not exists source text not null default 'ai';
alter table public.captions drop constraint if exists captions_source_check;
alter table public.captions add constraint captions_source_check check (source in ('ai', 'human'));
alter table public.captions alter column prompt drop not null;
alter table public.captions alter column model drop not null;
alter table public.captions alter column style drop not null;

-- One human caption per person per post.
create unique index if not exists captions_one_human_per_user_per_post
  on public.captions (post_id, created_by)
  where source = 'human';

-- Replace the old insert rule with two stricter ones. New captions must
-- always start at 0 votes, so nobody can insert a pre-boosted caption.
drop policy if exists "Users can add captions to their own posts" on public.captions;
drop policy if exists "Users can add AI captions to their own posts" on public.captions;
create policy "Users can add AI captions to their own posts"
  on public.captions for insert to authenticated
  with check (
    source = 'ai'
    and created_by = auth.uid()
    and upvotes = 0 and downvotes = 0
    and exists (select 1 from public.posts p where p.id = post_id and p.user_id = auth.uid())
  );

drop policy if exists "Users can add their own human captions" on public.captions;
create policy "Users can add their own human captions"
  on public.captions for insert to authenticated
  with check (
    source = 'human'
    and created_by = auth.uid()
    and upvotes = 0 and downvotes = 0
    and prompt is null and model is null
    and char_length(btrim(content)) between 1 and 140
  );
