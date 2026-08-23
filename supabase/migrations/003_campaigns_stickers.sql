create type public.campaign_status as enum ('draft','active','finished','archived');
create type public.sticker_rarity as enum ('COMMON','UNCOMMON','RARE','EPIC','LEGENDARY');

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  description text,
  start_date date not null,
  end_date date not null,
  completion_target int not null check (completion_target > 0),
  status public.campaign_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint campaigns_dates_check check (end_date >= start_date)
);
create index campaigns_business_id_idx on public.campaigns(business_id);
create trigger set_updated_at before update on public.campaigns
  for each row execute function public.set_updated_at();

create table public.stickers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  rarity public.sticker_rarity not null default 'COMMON',
  base_probability numeric(5,2) not null check (base_probability >= 0 and base_probability <= 100),
  status public.active_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on public.stickers
  for each row execute function public.set_updated_at();

create table public.campaign_stickers (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  sticker_id uuid not null references public.stickers(id) on delete restrict,
  probability numeric(5,2) not null check (probability >= 0 and probability <= 100),
  status public.active_status not null default 'active',
  unique (campaign_id, sticker_id)
);
create index campaign_stickers_campaign_idx on public.campaign_stickers(campaign_id);

alter table public.campaigns enable row level security;
alter table public.stickers enable row level security;
alter table public.campaign_stickers enable row level security;

create policy "campaigns_select_same_business" on public.campaigns
  for select using (business_id = public.current_business_id());

-- El catálogo de stickers es global (no pertenece a un negocio puntual);
-- cualquier usuario autenticado puede leerlo para poder renderizar su colección.
create policy "stickers_select_authenticated" on public.stickers
  for select using (auth.role() = 'authenticated');

create policy "campaign_stickers_select_same_business" on public.campaign_stickers
  for select using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_stickers.campaign_id
      and c.business_id = public.current_business_id()
    )
  );
