-- AquaSentinel: Create profiles table to store per-user role
-- Run this in Supabase SQL Editor

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  role       text not null check (role in ('citizen', 'farmer', 'authority')) default 'citizen',
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policy: users can read their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using ( auth.uid() = id );

-- Policy: users can insert their own profile (first Google login)
create policy "Users can insert own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

-- Policy: users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Grant access to authenticated users
grant select, insert, update on public.profiles to authenticated;

-- Index for fast uid lookups
create index if not exists profiles_id_idx on public.profiles(id);
