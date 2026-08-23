create extension if not exists "pgcrypto";

create type public.user_role as enum ('CUSTOMER', 'OPERATOR', 'ADMIN');
create type public.business_status as enum ('active', 'inactive');
create type public.active_status as enum ('active', 'inactive');

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  phone text,
  address text,
  status public.business_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  role public.user_role not null default 'CUSTOMER',
  name text not null,
  phone text not null default '',
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_business_id_idx on public.profiles(business_id);
create index profiles_role_idx on public.profiles(role);

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.businesses
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
