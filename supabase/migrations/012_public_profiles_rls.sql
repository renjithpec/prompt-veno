-- Fix profile visibility to allow anyone to read profiles
drop policy if exists "profiles can read own profile" on public.profiles;
create policy "public can read profiles" on public.profiles for select using (true);
