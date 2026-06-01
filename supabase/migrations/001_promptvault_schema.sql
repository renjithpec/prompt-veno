create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public)
values ('prompt-images', 'prompt-images', true)
on conflict (id) do update set public = true;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  avatar text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null,
  icon text not null default 'Sparkles',
  created_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  prompt_content text not null,
  preview_image text not null,
  category_id uuid not null references public.categories(id) on delete restrict,
  featured boolean not null default false,
  views integer not null default 0 check (views >= 0),
  copies integer not null default 0 check (copies >= 0),
  search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(prompt_content, '')), 'C')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prompt_tags (
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (prompt_id, tag_id)
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, prompt_id)
);

create table if not exists public.settings (
  id text primary key default 'settings',
  instagram_url text not null,
  instagram_username text not null,
  creator_name text not null,
  creator_avatar text not null,
  site_title text not null default 'Prompt Veno',
  site_description text not null default 'Premium AI prompts for viral creator workflows.',
  updated_at timestamptz not null default now()
);

create index if not exists prompts_search_idx on public.prompts using gin(search_vector);
create index if not exists prompts_category_idx on public.prompts(category_id);
create index if not exists prompts_views_idx on public.prompts(views desc);
create index if not exists prompts_copies_idx on public.prompts(copies desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists prompts_set_updated_at on public.prompts;
create trigger prompts_set_updated_at
before update on public.prompts
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, avatar)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.increment_prompt_metric(prompt_slug text, metric_name text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if metric_name = 'views' then
    update public.prompts set views = views + 1 where slug = prompt_slug;
  elsif metric_name = 'copies' then
    update public.prompts set copies = copies + 1 where slug = prompt_slug;
  else
    raise exception 'Unsupported metric %', metric_name;
  end if;
end;
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.prompts enable row level security;
alter table public.prompt_tags enable row level security;
alter table public.favorites enable row level security;
alter table public.settings enable row level security;

create policy "profiles can read own profile" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "profiles can update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

create policy "public read categories" on public.categories for select using (true);
create policy "admins manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "public read tags" on public.tags for select using (true);
create policy "admins manage tags" on public.tags for all using (public.is_admin()) with check (public.is_admin());

create policy "public read prompts" on public.prompts for select using (true);
create policy "admins manage prompts" on public.prompts for all using (public.is_admin()) with check (public.is_admin());

create policy "public read prompt tags" on public.prompt_tags for select using (true);
create policy "admins manage prompt tags" on public.prompt_tags for all using (public.is_admin()) with check (public.is_admin());

create policy "users read own favorites" on public.favorites for select using (auth.uid() = user_id);
create policy "users manage own favorites" on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "public read settings" on public.settings for select using (true);
create policy "admins manage settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());

create policy "public read prompt images" on storage.objects for select using (bucket_id = 'prompt-images');
create policy "admins upload prompt images" on storage.objects for insert with check (bucket_id = 'prompt-images' and public.is_admin());
create policy "admins update prompt images" on storage.objects for update using (bucket_id = 'prompt-images' and public.is_admin()) with check (bucket_id = 'prompt-images' and public.is_admin());
create policy "admins delete prompt images" on storage.objects for delete using (bucket_id = 'prompt-images' and public.is_admin());

insert into public.settings (id, instagram_url, instagram_username, creator_name, creator_avatar, site_title, site_description)
values ('settings', 'https://www.instagram.com/promptveno/', 'Prompt Veno', 'Prompt Veno', 'https://i.pravatar.cc/240?img=12', 'Prompt Veno', 'Premium AI prompts for viral creator workflows.')
on conflict (id) do update set
  instagram_url = excluded.instagram_url,
  instagram_username = excluded.instagram_username,
  creator_name = excluded.creator_name,
  creator_avatar = excluded.creator_avatar,
  site_title = excluded.site_title,
  site_description = excluded.site_description,
  updated_at = now();

insert into public.categories (name, slug, description, icon) values
('Veo 3', 'veo3', 'Cinematic video prompts for viral short-form ads and reels.', 'Clapperboard'),
('ChatGPT', 'chatgpt', 'Research, writing, scripts, hooks, and creator operating systems.', 'MessageSquareText'),
('Flux', 'flux', 'High-end image prompts for product, fashion, and editorial content.', 'Image'),
('Midjourney', 'midjourney', 'Premium visuals, thumbnails, posters, and brand concepts.', 'Sparkles'),
('Kling', 'kling', 'Motion-first prompts built for expressive AI video generation.', 'Film'),
('Instagram', 'instagram', 'Hooks, captions, reel ideas, carousels, and growth systems.', 'Instagram')
on conflict (slug) do nothing;

insert into public.tags (name, slug) values
('Viral', 'viral'),
('Reels', 'reels'),
('Product', 'product'),
('Cinematic', 'cinematic'),
('Hooks', 'hooks'),
('Growth', 'growth')
on conflict (slug) do nothing;

with cat as (
  select id, slug from public.categories
)
insert into public.prompts (title, slug, description, prompt_content, preview_image, category_id, featured, views, copies)
select 'Cinematic Veo 3 Car Commercial', 'cinematic-veo3-car-commercial', 'A polished luxury car ad prompt with premium lighting, camera moves, and product drama.', 'Create a 9:16 cinematic Veo 3 video of a midnight-black electric sports car moving through a rain-slick city at blue hour. Use low tracking shots, reflective asphalt, soft volumetric light, macro details of wheels and headlights, tasteful lens flares, luxury commercial pacing, and a final hero frame with space for a short Instagram Reel caption. Keep the edit under 8 seconds, premium, realistic, and brand-safe.', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80', cat.id, true, 18420, 6721 from cat where slug = 'veo3'
union all
select '30 Reel Hooks For Any Niche', '30-reel-hooks-for-any-niche', 'Generate scroll-stopping hooks for creators, founders, coaches, and students.', 'Act as an Instagram growth strategist. Ask me for my niche, audience, offer, and tone. Then produce 30 short Reel hooks sorted by curiosity, contradiction, transformation, proof, and urgency. Each hook must fit in the first 2 seconds of a Reel, avoid clickbait, and include a one-line content angle plus a suggested visual opening.', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80', cat.id, true, 22630, 9234 from cat where slug = 'chatgpt'
union all
select 'Instagram Carousel Growth System', 'instagram-carousel-growth-system', 'Turn one idea into a polished carousel with hook, structure, caption, and CTA.', 'Act as a senior Instagram content strategist. Turn this idea into a 7-slide carousel for [AUDIENCE]. Slide 1 must be a high-curiosity hook. Slides 2-6 must teach one practical idea per slide with short copy. Slide 7 must include a save/share CTA. Then write a caption, 10 niche hashtags, and one Reel adaptation of the same idea.', 'https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&w=1200&q=80', cat.id, true, 20043, 8125 from cat where slug = 'instagram'
on conflict (slug) do nothing;
