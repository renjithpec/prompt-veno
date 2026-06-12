-- 1. Create prompts_dislikes table
create table if not exists public.prompts_dislikes (
  user_id uuid references public.profiles(id) on delete cascade,
  prompt_id uuid references public.prompts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, prompt_id)
);

-- 2. Create prompts_saves table
create table if not exists public.prompts_saves (
  user_id uuid references public.profiles(id) on delete cascade,
  prompt_id uuid references public.prompts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, prompt_id)
);

-- 3. Add counts to prompts table
alter table public.prompts add column if not exists dislikes_count integer not null default 0;
alter table public.prompts add column if not exists saves_count integer not null default 0;
alter table public.prompts add column if not exists shares_count integer not null default 0;

-- 4. Triggers to update counts
-- Dislikes
create or replace function update_dislikes_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.prompts set dislikes_count = dislikes_count + 1 where id = NEW.prompt_id;
  elsif (TG_OP = 'DELETE') then
    update public.prompts set dislikes_count = GREATEST(0, dislikes_count - 1) where id = OLD.prompt_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_dislike on public.prompts_dislikes;
create trigger on_dislike
  after insert or delete on public.prompts_dislikes
  for each row execute function update_dislikes_count();

-- Saves
create or replace function update_saves_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.prompts set saves_count = saves_count + 1 where id = NEW.prompt_id;
  elsif (TG_OP = 'DELETE') then
    update public.prompts set saves_count = GREATEST(0, saves_count - 1) where id = OLD.prompt_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_save on public.prompts_saves;
create trigger on_save
  after insert or delete on public.prompts_saves
  for each row execute function update_saves_count();

-- RLS for prompts_dislikes
alter table public.prompts_dislikes enable row level security;
drop policy if exists "Public read dislikes" on public.prompts_dislikes;
drop policy if exists "Users can dislike" on public.prompts_dislikes;
drop policy if exists "Users can undislike" on public.prompts_dislikes;

create policy "Public read dislikes" on public.prompts_dislikes for select using (true);
create policy "Users can dislike" on public.prompts_dislikes for insert with check (auth.uid() = user_id);
create policy "Users can undislike" on public.prompts_dislikes for delete using (auth.uid() = user_id);

-- RLS for prompts_saves
alter table public.prompts_saves enable row level security;
drop policy if exists "Users can read own saves" on public.prompts_saves;
drop policy if exists "Users can save" on public.prompts_saves;
drop policy if exists "Users can unsave" on public.prompts_saves;

create policy "Users can read own saves" on public.prompts_saves for select using (auth.uid() = user_id);
create policy "Users can save" on public.prompts_saves for insert with check (auth.uid() = user_id);
create policy "Users can unsave" on public.prompts_saves for delete using (auth.uid() = user_id);

-- Function to increment shares securely via RPC
create or replace function increment_prompt_shares(prompt_id uuid)
returns void as $$
begin
  update public.prompts set shares_count = shares_count + 1 where id = prompt_id;
end;
$$ language plpgsql security definer;
