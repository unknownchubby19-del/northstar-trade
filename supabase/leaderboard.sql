create table if not exists public.leaderboard (
  id serial primary key,
  player text not null,
  score integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.leaderboard enable row level security;

drop policy if exists "Authenticated users can read leaderboard" on public.leaderboard;
create policy "Authenticated users can read leaderboard"
  on public.leaderboard
  for select
  to authenticated
  using (true);

grant select on public.leaderboard to authenticated;

insert into public.leaderboard (player, score)
select sample.player, sample.score
from (values
  ('Jordan Davis', 2400),
  ('Alex Morgan', 1850),
  ('Taylor Lee', 1325)
) as sample(player, score)
where not exists (select 1 from public.leaderboard);

-- Use this query in the Supabase SQL Editor to inspect the top 50 scores.
select player, score, created_at
from public.leaderboard
order by score desc, created_at asc
limit 50;
