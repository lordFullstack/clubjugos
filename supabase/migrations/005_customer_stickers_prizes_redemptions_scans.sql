create type public.customer_prize_status as enum ('AVAILABLE','REDEEMED','EXPIRED');

create table public.customer_stickers (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  sticker_id uuid not null references public.stickers(id) on delete restrict,
  qr_token_id uuid references public.qr_tokens(id) on delete set null,
  obtained_at timestamptz not null default now(),
  is_duplicate boolean not null default false
);
create index customer_stickers_customer_idx on public.customer_stickers(customer_id);
create index customer_stickers_campaign_idx on public.customer_stickers(campaign_id);

create table public.prizes (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  name text not null,
  description text,
  image_url text,
  required_stickers int not null check (required_stickers > 0),
  max_value numeric(10,2),
  expires_days int,
  status public.active_status not null default 'active',
  created_at timestamptz not null default now()
);
create index prizes_business_idx on public.prizes(business_id);

create table public.customer_prizes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  prize_id uuid not null references public.prizes(id) on delete restrict,
  status public.customer_prize_status not null default 'AVAILABLE',
  earned_at timestamptz not null default now(),
  expires_at timestamptz,
  redeemed_at timestamptz,
  unique (customer_id, prize_id)
);
create index customer_prizes_customer_idx on public.customer_prizes(customer_id);

create table public.redemptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  prize_id uuid not null references public.prizes(id) on delete restrict,
  operator_id uuid references public.profiles(id) on delete set null,
  redeemed_at timestamptz not null default now(),
  notes text
);
create index redemptions_customer_idx on public.redemptions(customer_id);

create table public.scan_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid references public.profiles(id) on delete set null,
  qr_token_id uuid references public.qr_tokens(id) on delete set null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  sticker_id uuid references public.stickers(id) on delete set null,
  success boolean not null,
  failure_reason text,
  created_at timestamptz not null default now()
);
create index scan_events_business_idx on public.scan_events(business_id);
create index scan_events_customer_idx on public.scan_events(customer_id);

alter table public.customer_stickers enable row level security;
alter table public.prizes enable row level security;
alter table public.customer_prizes enable row level security;
alter table public.redemptions enable row level security;
alter table public.scan_events enable row level security;

-- Todas estas tablas: el cliente puede LEER solo lo suyo, el staff puede LEER
-- lo de su negocio. Ninguna tiene policy de INSERT/UPDATE/DELETE para
-- anon/authenticated: esas operaciones (entregar sticker, desbloquear premio,
-- canjear, registrar escaneo) las hace exclusivamente el backend con service_role.

create policy "customer_stickers_select_own" on public.customer_stickers
  for select using (customer_id = auth.uid());
create policy "customer_stickers_select_staff" on public.customer_stickers
  for select using (
    public.current_role() in ('ADMIN','OPERATOR')
    and exists (
      select 1 from public.campaigns c
      where c.id = customer_stickers.campaign_id
      and c.business_id = public.current_business_id()
    )
  );

create policy "prizes_select_same_business" on public.prizes
  for select using (business_id = public.current_business_id());

create policy "customer_prizes_select_own" on public.customer_prizes
  for select using (customer_id = auth.uid());
create policy "customer_prizes_select_staff" on public.customer_prizes
  for select using (
    public.current_role() in ('ADMIN','OPERATOR')
    and exists (
      select 1 from public.prizes p
      where p.id = customer_prizes.prize_id
      and p.business_id = public.current_business_id()
    )
  );

create policy "redemptions_select_own" on public.redemptions
  for select using (customer_id = auth.uid());
create policy "redemptions_select_staff" on public.redemptions
  for select using (
    public.current_role() in ('ADMIN','OPERATOR')
    and exists (
      select 1 from public.prizes p
      where p.id = redemptions.prize_id
      and p.business_id = public.current_business_id()
    )
  );

create policy "scan_events_select_own" on public.scan_events
  for select using (customer_id = auth.uid());
create policy "scan_events_select_staff" on public.scan_events
  for select using (
    public.current_role() in ('ADMIN','OPERATOR')
    and business_id = public.current_business_id()
  );
