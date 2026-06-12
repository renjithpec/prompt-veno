-- 1. Create prompts_likes table
create table if not exists public.prompts_likes (
  user_id uuid references public.profiles(id) on delete cascade,
  prompt_id uuid references public.prompts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, prompt_id)
);

-- 2. Add likes_count to prompts table
alter table public.prompts add column if not exists likes_count integer not null default 0;

-- 3. Trigger to update likes_count
create or replace function update_likes_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.prompts set likes_count = likes_count + 1 where id = NEW.prompt_id;
  elsif (TG_OP = 'DELETE') then
    update public.prompts set likes_count = likes_count - 1 where id = OLD.prompt_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_like on public.prompts_likes;
create trigger on_like
  after insert or delete on public.prompts_likes
  for each row execute function update_likes_count();

-- RLS for prompts_likes
alter table public.prompts_likes enable row level security;

drop policy if exists "Public read likes" on public.prompts_likes;
drop policy if exists "Users can like" on public.prompts_likes;
drop policy if exists "Users can unlike" on public.prompts_likes;

create policy "Public read likes" on public.prompts_likes for select using (true);
create policy "Users can like" on public.prompts_likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike" on public.prompts_likes for delete using (auth.uid() = user_id);


-- 4. Create notifications table
do $$ 
begin
  create type notification_type as enum ('like', 'follow', 'new_post');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null, -- The recipient
  actor_id uuid references public.profiles(id) on delete cascade not null, -- The person who did the action
  type notification_type not null,
  prompt_id uuid references public.prompts(id) on delete cascade, -- Nullable context
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS for notifications
alter table public.notifications enable row level security;

drop policy if exists "Users can read own notifications" on public.notifications;
drop policy if exists "System can insert notifications" on public.notifications;
drop policy if exists "Users can update own notifications" on public.notifications;

create policy "Users can read own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "System can insert notifications" on public.notifications for insert with check (true);
create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);

-- 5. Triggers for generating notifications
-- A. On Follow
create or replace function notify_on_follow()
returns trigger as $$
begin
  -- Don't notify if following oneself (shouldn't happen, but just in case)
  if NEW.follower_id != NEW.following_id then
    insert into public.notifications (user_id, actor_id, type)
    values (NEW.following_id, NEW.follower_id, 'follow');
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_follow_notify on public.user_follows;
create trigger on_follow_notify
  after insert on public.user_follows
  for each row execute function notify_on_follow();

-- B. On Like
create or replace function notify_on_like()
returns trigger as $$
declare
  prompt_owner_id uuid;
begin
  select user_id into prompt_owner_id from public.prompts where id = NEW.prompt_id;
  
  -- Don't notify if liking own prompt
  if NEW.user_id != prompt_owner_id then
    insert into public.notifications (user_id, actor_id, type, prompt_id)
    values (prompt_owner_id, NEW.user_id, 'like', NEW.prompt_id);
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_like_notify on public.prompts_likes;
create trigger on_like_notify
  after insert on public.prompts_likes
  for each row execute function notify_on_like();

-- Note: 'new_post' notifications will be handled via application logic (Server Action) 
-- when a prompt is published, as it needs to fan out to all followers.

-- Enable realtime for notifications table
do $$
begin
  alter publication supabase_realtime add table notifications;
exception
  when duplicate_object then null;
end $$;
