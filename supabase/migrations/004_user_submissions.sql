alter table public.prompts add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.prompts add column if not exists status text not null default 'approved' check (status in ('pending', 'approved', 'rejected'));

-- Update existing prompts to be owned by the first admin if user_id is null
do $$
declare
  admin_id uuid;
begin
  select id into admin_id from public.profiles where role = 'admin' limit 1;
  update public.prompts set user_id = admin_id where user_id is null;
end $$;

-- Change default status to 'pending' for all future user submissions
alter table public.prompts alter column status set default 'pending';

-- Drop the old overly-permissive public read policy
drop policy if exists "public read prompts" on public.prompts;

-- Recreate policy: public can only read approved prompts, but users can read their own, and admins read all
create policy "public read prompts" on public.prompts for select using (
  status = 'approved' or public.is_admin() or auth.uid() = user_id
);

-- Allow authenticated users to insert their own prompts
drop policy if exists "users insert prompts" on public.prompts;
create policy "users insert prompts" on public.prompts for insert with check (
  auth.uid() = user_id
);
