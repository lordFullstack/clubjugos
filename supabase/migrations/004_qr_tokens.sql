create type public.qr_status as enum ('AVAILABLE','USED','EXPIRED','CANCELLED');

create table public.qr_tokens (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  token text not null unique,
  status public.qr_status not null default 'AVAILABLE',
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index qr_tokens_token_idx on public.qr_tokens(token);
create index qr_tokens_status_idx on public.qr_tokens(status);

-- RLS habilitado SIN ninguna policy para anon/authenticated:
-- ningún cliente puede leer ni escribir esta tabla bajo ninguna circunstancia.
-- Solo el backend, usando la service_role key (que ignora RLS), puede validar
-- y marcar tokens. Esto es intencional: el frontend nunca decide si un QR es válido.
alter table public.qr_tokens enable row level security;
