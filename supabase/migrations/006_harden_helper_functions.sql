-- Movemos los helpers a un schema "private" que PostgREST no expone como API,
-- para que sigan funcionando dentro de las policies de RLS pero no sean
-- invocables directamente como /rest/v1/rpc/current_role desde afuera.
create schema if not exists private;

create function private.current_role()
returns public.user_role
language sql security definer stable set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create function private.current_business_id()
returns uuid
language sql security definer stable set search_path = public as $$
  select business_id from public.profiles where id = auth.uid();
$$;

revoke all on schema private from anon, authenticated;

-- Recreamos las policies que usaban las funciones viejas, apuntando al schema private.
drop policy "businesses_select_own" on public.businesses;
create policy "businesses_select_own" on public.businesses
  for select using (id = private.current_business_id());

drop policy "profiles_select_staff_same_business" on public.profiles;
create policy "profiles_select_staff_same_business" on public.profiles
  for select using (
    private.current_role() in ('ADMIN','OPERATOR')
    and business_id = private.current_business_id()
  );

drop policy "campaigns_select_same_business" on public.campaigns;
create policy "campaigns_select_same_business" on public.campaigns
  for select using (business_id = private.current_business_id());

drop policy "campaign_stickers_select_same_business" on public.campaign_stickers;
create policy "campaign_stickers_select_same_business" on public.campaign_stickers
  for select using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_stickers.campaign_id
      and c.business_id = private.current_business_id()
    )
  );

drop policy "customer_stickers_select_staff" on public.customer_stickers;
create policy "customer_stickers_select_staff" on public.customer_stickers
  for select using (
    private.current_role() in ('ADMIN','OPERATOR')
    and exists (
      select 1 from public.campaigns c
      where c.id = customer_stickers.campaign_id
      and c.business_id = private.current_business_id()
    )
  );

drop policy "prizes_select_same_business" on public.prizes;
create policy "prizes_select_same_business" on public.prizes
  for select using (business_id = private.current_business_id());

drop policy "customer_prizes_select_staff" on public.customer_prizes;
create policy "customer_prizes_select_staff" on public.customer_prizes
  for select using (
    private.current_role() in ('ADMIN','OPERATOR')
    and exists (
      select 1 from public.prizes p
      where p.id = customer_prizes.prize_id
      and p.business_id = private.current_business_id()
    )
  );

drop policy "redemptions_select_staff" on public.redemptions;
create policy "redemptions_select_staff" on public.redemptions
  for select using (
    private.current_role() in ('ADMIN','OPERATOR')
    and exists (
      select 1 from public.prizes p
      where p.id = redemptions.prize_id
      and p.business_id = private.current_business_id()
    )
  );

drop policy "scan_events_select_staff" on public.scan_events;
create policy "scan_events_select_staff" on public.scan_events
  for select using (
    private.current_role() in ('ADMIN','OPERATOR')
    and business_id = private.current_business_id()
  );

-- Ya no se necesitan las versiones públicas expuestas como RPC.
drop function public.current_role();
drop function public.current_business_id();

-- Fijamos el search_path de la función de timestamps (antes no lo tenía).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- handle_new_user es una función de trigger; no debe poder invocarse manualmente
-- vía API (de todos modos fallaría por faltarle el contexto de trigger, pero
-- reforzamos el permiso por buenas prácticas).
revoke execute on function public.handle_new_user() from public, anon, authenticated;
