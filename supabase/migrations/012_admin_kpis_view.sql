-- Vista de métricas para el dashboard admin. security_invoker hace que la
-- vista respete el RLS del usuario que consulta, no del dueño de la vista:
-- un ADMIN/OPERATOR solo va a ver los números de su propio negocio, gracias
-- a las policies que ya existen en profiles/scan_events/campaigns/etc.
create view public.admin_kpis
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
  (select count(distinct se.customer_id) from public.scan_events se where se.business_id = b.id and se.success and se.created_at >= now() - interval '7 days') as active_customers_7d
from public.businesses b;

grant select on public.admin_kpis to authenticated;
