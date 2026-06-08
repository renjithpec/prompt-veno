-- Security hardening migration
-- Adds login_attempts tracking table for brute-force protection

-- Login attempts tracking table
create table if not exists public.login_attempts (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null,
  email text not null,
  attempted_at timestamptz not null default now()
);

-- Index for fast lookups by IP + time
create index if not exists login_attempts_ip_idx on public.login_attempts(ip_address, attempted_at desc);

-- Auto-cleanup old login attempts (older than 1 hour)
create or replace function public.cleanup_login_attempts()
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.login_attempts where attempted_at < now() - interval '1 hour';
end;
$$;

-- RLS on login_attempts — no public access, only service role can read/write
alter table public.login_attempts enable row level security;

-- No public policies = deny all by default. Only service_role (admin client) can access.
-- This is intentional: login_attempts is managed purely server-side.

-- Tighten profiles: ensure users cannot change their own role
create or replace function public.prevent_role_change()
returns trigger language plpgsql as $$
begin
  if old.role is distinct from new.role and not public.is_admin() then
    raise exception 'Role changes require admin privileges';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_role_change on public.profiles;
create trigger prevent_role_change
before update on public.profiles
for each row execute function public.prevent_role_change();
