-- Reescribe el motor de sorteo:
--
-- 1) COLECCIONABLE: se elige al azar, con distribución uniforme, entre los
--    stickers coleccionables que el cliente todavía NO tiene. Nunca entrega
--    un duplicado mientras falten. Si ya los tiene todos, esta parte no
--    entrega nada nuevo (el álbum ya está completo) — el cliente sigue
--    pudiendo escanear hasta que cierre la campaña, solo que ya no suma
--    al álbum.
--
-- 2) ESPECIAL: independientemente de lo anterior, se hace como máximo UN
--    sorteo de premio especial por escaneo. Se recorren los stickers
--    SPECIAL activos en orden aleatorio y, para cada uno, se evalúa su
--    propia probabilidad (tasa de caída real en %, no ponderada contra las
--    demás). El primero que "cae" gana; si ninguno cae, no hay premio
--    especial en este escaneo (el frontend debe mostrar "sigue intentando").
--
-- 3) El premio de "colección completa" (el premio principal por
--    completion_target) se mantiene igual que antes, pero ahora excluye
--    explícitamente cualquier premio que ya esté vinculado como premio
--    especial de algún sticker, para que ambos pozos de premios no se mezclen.
create or replace function public.redeem_qr_token(
  p_token text,
  p_customer_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_qr record;
  v_campaign record;
  v_collectible_ids uuid[];
  v_owned_ids uuid[];
  v_remaining_ids uuid[];
  v_sticker_id uuid;
  v_sticker record;
  v_obtained_count int;
  v_prize record;
  v_prize_unlocked boolean := false;
  v_special_sticker_id uuid;
  v_special_prize_id uuid;
  v_special record;
  v_special_is_duplicate boolean;
  v_special_prize record;
  v_special_prize_unlocked boolean := false;
  rec record;
begin
  select * into v_qr from public.qr_tokens where token = p_token for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'QR_NOT_FOUND');
  end if;

  if v_qr.status = 'USED' then
    insert into public.scan_events (business_id, customer_id, qr_token_id, campaign_id, success, failure_reason)
    values (v_qr.business_id, p_customer_id, v_qr.id, v_qr.campaign_id, false, 'QR_USED');
    return jsonb_build_object('success', false, 'error', 'QR_USED');
  end if;

  if v_qr.status = 'CANCELLED' then
    insert into public.scan_events (business_id, customer_id, qr_token_id, campaign_id, success, failure_reason)
    values (v_qr.business_id, p_customer_id, v_qr.id, v_qr.campaign_id, false, 'QR_CANCELLED');
    return jsonb_build_object('success', false, 'error', 'QR_CANCELLED');
  end if;

  if v_qr.status = 'EXPIRED' or v_qr.expires_at < now() then
    update public.qr_tokens set status = 'EXPIRED' where id = v_qr.id;
    insert into public.scan_events (business_id, customer_id, qr_token_id, campaign_id, success, failure_reason)
    values (v_qr.business_id, p_customer_id, v_qr.id, v_qr.campaign_id, false, 'QR_EXPIRED');
    return jsonb_build_object('success', false, 'error', 'QR_EXPIRED');
  end if;

  select * into v_campaign from public.campaigns where id = v_qr.campaign_id;

  if v_campaign.status <> 'active' then
    insert into public.scan_events (business_id, customer_id, qr_token_id, campaign_id, success, failure_reason)
    values (v_qr.business_id, p_customer_id, v_qr.id, v_qr.campaign_id, false, 'CAMPAIGN_INACTIVE');
    return jsonb_build_object('success', false, 'error', 'CAMPAIGN_INACTIVE');
  end if;

  -- ===== 1) Sorteo coleccionable: sin repetición mientras falten =====
  select coalesce(array_agg(cs.sticker_id), array[]::uuid[]) into v_collectible_ids
  from public.campaign_stickers cs
  join public.stickers s on s.id = cs.sticker_id
  where cs.campaign_id = v_campaign.id and cs.status = 'active' and s.kind = 'COLLECTIBLE';

  if array_length(v_collectible_ids, 1) is null then
    insert into public.scan_events (business_id, customer_id, qr_token_id, campaign_id, success, failure_reason)
    values (v_qr.business_id, p_customer_id, v_qr.id, v_qr.campaign_id, false, 'NO_STICKERS_CONFIGURED');
    return jsonb_build_object('success', false, 'error', 'NO_STICKERS_CONFIGURED');
  end if;

  select coalesce(array_agg(sticker_id), array[]::uuid[]) into v_owned_ids
  from public.customer_stickers
  where customer_id = p_customer_id and campaign_id = v_campaign.id
    and sticker_id = any(v_collectible_ids);

  select coalesce(array_agg(x), array[]::uuid[]) into v_remaining_ids
  from unnest(v_collectible_ids) x
  where x <> all(v_owned_ids);

  if array_length(v_remaining_ids, 1) is not null then
    v_sticker_id := v_remaining_ids[1 + floor(random() * array_length(v_remaining_ids, 1))::int];

    insert into public.customer_stickers (customer_id, campaign_id, sticker_id, qr_token_id, is_duplicate)
    values (p_customer_id, v_campaign.id, v_sticker_id, v_qr.id, false);

    select * into v_sticker from public.stickers where id = v_sticker_id;
  end if;

  -- ===== 2) Sorteo de premio especial: máximo uno por escaneo =====
  for rec in
    select cs.sticker_id, cs.probability, s.special_prize_id
    from public.campaign_stickers cs
    join public.stickers s on s.id = cs.sticker_id
    where cs.campaign_id = v_campaign.id and cs.status = 'active' and s.kind = 'SPECIAL'
    order by random()
  loop
    if random() * 100 < rec.probability then
      v_special_sticker_id := rec.sticker_id;
      v_special_prize_id := rec.special_prize_id;
      exit;
    end if;
  end loop;

  if v_special_sticker_id is not null then
    select exists(
      select 1 from public.customer_stickers
      where customer_id = p_customer_id and campaign_id = v_campaign.id and sticker_id = v_special_sticker_id
    ) into v_special_is_duplicate;

    insert into public.customer_stickers (customer_id, campaign_id, sticker_id, qr_token_id, is_duplicate)
    values (p_customer_id, v_campaign.id, v_special_sticker_id, v_qr.id, v_special_is_duplicate);

    select * into v_special from public.stickers where id = v_special_sticker_id;

    if v_special_prize_id is not null then
      insert into public.customer_prizes (customer_id, prize_id, status, expires_at)
      select p_customer_id, v_special_prize_id, 'AVAILABLE',
        case when p.expires_days is not null
          then now() + (p.expires_days || ' days')::interval
          else null
        end
      from public.prizes p where p.id = v_special_prize_id
      on conflict (customer_id, prize_id) do nothing
      returning true into v_special_prize_unlocked;

      if v_special_prize_unlocked then
        select * into v_special_prize from public.prizes where id = v_special_prize_id;
      end if;
    end if;
  end if;

  update public.qr_tokens
  set status = 'USED', used_at = now(), used_by = p_customer_id
  where id = v_qr.id;

  insert into public.scan_events (business_id, customer_id, qr_token_id, campaign_id, sticker_id, success)
  values (v_qr.business_id, p_customer_id, v_qr.id, v_campaign.id, coalesce(v_sticker_id, v_special_sticker_id), true);

  -- ===== 3) Progreso del álbum y premio principal por completarlo =====
  select count(distinct sticker_id) into v_obtained_count
  from public.customer_stickers
  where customer_id = p_customer_id and campaign_id = v_campaign.id
    and sticker_id = any(v_collectible_ids);

  if v_obtained_count >= v_campaign.completion_target then
    select * into v_prize from public.prizes p
    where p.campaign_id = v_campaign.id and p.status = 'active'
      and not exists (select 1 from public.stickers s where s.special_prize_id = p.id)
    limit 1;

    if found then
      insert into public.customer_prizes (customer_id, prize_id, status, expires_at)
      values (
        p_customer_id,
        v_prize.id,
        'AVAILABLE',
        case when v_prize.expires_days is not null
          then now() + (v_prize.expires_days || ' days')::interval
          else null
        end
      )
      on conflict (customer_id, prize_id) do nothing
      returning true into v_prize_unlocked;
    end if;
  end if;

  return jsonb_build_object(
    'success', true,
    'sticker', case when v_sticker_id is null then null else jsonb_build_object(
      'id', v_sticker.id,
      'name', v_sticker.name,
      'imageUrl', v_sticker.image_url,
      'rarity', v_sticker.rarity
    ) end,
    'collectionComplete', v_sticker_id is null,
    'obtainedCount', v_obtained_count,
    'completionTarget', v_campaign.completion_target,
    'prizeUnlocked', coalesce(v_prize_unlocked, false),
    'special', case when v_special_sticker_id is null then null else jsonb_build_object(
      'id', v_special.id,
      'name', v_special.name,
      'imageUrl', v_special.image_url,
      'rarity', v_special.rarity,
      'isDuplicate', v_special_is_duplicate,
      'prizeUnlocked', coalesce(v_special_prize_unlocked, false),
      'prizeName', case when v_special_prize_unlocked then v_special_prize.name else null end
    ) end
  );
end;
$$;

revoke execute on function public.redeem_qr_token(text, uuid) from public, anon, authenticated;
grant execute on function public.redeem_qr_token(text, uuid) to service_role;
