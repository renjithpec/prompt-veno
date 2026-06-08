alter table public.profiles add column if not exists is_verified boolean not null default false;
alter table public.profiles add column if not exists follower_count integer not null default 0;
alter table public.profiles add column if not exists following_count integer not null default 0;

create table if not exists public.user_follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id)
);

create or replace function update_follower_counts()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.profiles set follower_count = follower_count + 1 where id = NEW.following_id;
    update public.profiles set following_count = following_count + 1 where id = NEW.follower_id;
    
    update public.profiles set is_verified = true where id = NEW.following_id and follower_count >= 1000;
  elsif (TG_OP = 'DELETE') then
    update public.profiles set follower_count = follower_count - 1 where id = OLD.following_id;
    update public.profiles set following_count = following_count - 1 where id = OLD.follower_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_follow on public.user_follows;
create trigger on_follow
  after insert or delete on public.user_follows
  for each row execute function update_follower_counts();

alter table public.user_follows enable row level security;

drop policy if exists "Public read follows" on public.user_follows;
create policy "Public read follows"
  on public.user_follows for select
  using (true);

drop policy if exists "Users can insert their own follows" on public.user_follows;
create policy "Users can insert their own follows"
  on public.user_follows for insert
  with check (auth.uid() = follower_id);

drop policy if exists "Users can delete their own follows" on public.user_follows;
create policy "Users can delete their own follows"
  on public.user_follows for delete
  using (auth.uid() = follower_id);
