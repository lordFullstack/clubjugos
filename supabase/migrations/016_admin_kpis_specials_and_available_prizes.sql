-- LOOP 07 (admin): el dashboard pide 5 KPIs puntuales — escaneos, stickers
-- entregados, especiales entregados, premios disponibles y redenciones.
-- La vista admin_kpis (migración 012) ya cubría escaneos/stickers/redenciones
-- pero no tenía "especiales entregados" (stickers.kind = 'SPECIAL' entregados)
-- ni "premios disponibles" (customer_prizes.status = 'AVAILABLE' ahora mismo,
-- distinto de "prizes_unlocked" que cuenta el histórico completo).
--
-- Aditivo y no destructivo: mantiene todas las columnas existentes en su
-- mismo lugar y agrega las dos nuevas al final — `create or replace view`
-- no permite reordenar/insertar columnas en medio, solo agregar al final
-- (Postgres 42P16 si se intenta lo primero). security_invoker sigue igual
-- (RLS del que consulta, no del dueño de la vista).
create or replace view public.admin_kpis
with (security_invoker = true) as
select
  b.id as business_id,
  (select count(*) from public.profiles p where p.business_id = b.id and p.role = 'CUSTOMER') as total_customers,
  (select count(*) from public.scan_events se where se.business_id = b.id and se.success) as total_scans,
  (select count(*) from public.customer_stickers cs join public.campaigns c on c.id = cs.campaign_id where c.business_id = b.id) as stickers_delivered,
  (select count(*) from public.customer_stickers cs join public.campaigns c on c.id = cs.campaign_id where c.business_id = b.id and cs.is_duplicate) as stickers_duplicated,
  (
    select count(*) from (
      select cs.customer_id, cs.campaign_id
      from public.customer_stickers cs
      join public.campaigns c on c.id = cs.campaign_id
      where c.business_id = b.id
      group by cs.customer_id, cs.campaign_id, c.completion_target
      having count(distinct cs.sticker_id) >= c.completion_target
    ) completed
  ) as completed_collections,
  (select count(*) from public.customer_prizes cp join public.prizes pr on pr.id = cp.prize_id where pr.business_id = b.id) as prizes_unlocked,
  (select count(*) from public.customer_prizes cp join public.prizes pr on pr.id = cp.prize_id where pr.business_id = b.id and cp.status = 'REDEEMED') as prizes_redeemed,
  (select count(distinct se.customer_id) from public.scan_events se where se.business_id = b.id and se.success and se.created_at >= now() - interval '7 days') as active_customers_7d,
  (
    select count(*)
    from public.customer_stickers cs
    join public.campaigns c on c.id = cs.campaign_id
    join public.stickers s on s.id = cs.sticker_id
    where c.business_id = b.id and s.kind = 'SPECIAL'
  ) as specials_delivered,
  (select count(*) from public.customer_prizes cp join public.prizes pr on pr.id = cp.prize_id where pr.business_id = b.id and cp.status = 'AVAILABLE') as prizes_available
from public.businesses b;

grant select on public.admin_kpis to authenticated;
