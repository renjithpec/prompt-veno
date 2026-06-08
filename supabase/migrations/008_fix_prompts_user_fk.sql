-- Fix the foreign key on prompts to point to public.profiles instead of auth.users
-- so that PostgREST can auto-join the profiles table when fetching prompts.

alter table public.prompts drop constraint if exists prompts_user_id_fkey;

alter table public.prompts
add constraint prompts_user_id_fkey
foreign key (user_id) references public.profiles(id) on delete cascade;
