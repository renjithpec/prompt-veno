-- Add coins column to profiles
alter table public.profiles add column if not exists coins integer not null default 0;

-- Create coin_transactions table
create table if not exists public.coin_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.coin_transactions enable row level security;

-- Add policies
create policy "users can view own transactions" 
on public.coin_transactions for select 
using (auth.uid() = user_id);

create policy "admins can view all transactions" 
on public.coin_transactions for select 
using (public.is_admin());

create policy "admins can insert transactions" 
on public.coin_transactions for insert 
with check (public.is_admin());
