-- Create prompt_categories mapping table
create table if not exists public.prompt_categories (
  prompt_id uuid references public.prompts(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  primary key (prompt_id, category_id)
);

-- Enable RLS
alter table public.prompt_categories enable row level security;

create policy "prompt categories are viewable by everyone" 
on public.prompt_categories for select using (true);

-- Migrate existing data from prompts to prompt_categories
insert into public.prompt_categories (prompt_id, category_id)
select id, category_id from public.prompts where category_id is not null
on conflict do nothing;

-- We will NOT drop the old category_id column just yet to prevent breaking queries in transition, 
-- but we will remove the NOT NULL constraint if it exists.
alter table public.prompts alter column category_id drop not null;
