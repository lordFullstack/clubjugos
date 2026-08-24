-- Función atómica: valida un QR y entrega un sticker en una sola transacción.
-- El "select ... for update" bloquea la fila del token: si dos requests
-- simultáneas llegan con el mismo QR, la segunda espera a que la primera
-- termine y confirme, y entonces ve status='USED' y falla limpiamente.
-- Esto es lo que garantiza que un mismo QR nunca entregue dos stickers.
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
  v_sticker_id uuid;
  v_sticker record;
  v_is_duplicate boolean;
  v_obtained_count int;
  v_prize record;
  v_prize_unlocked boolean := false;
  v_rand numeric;
  v_cumulative numeric := 0;
  v_total_weight numeric;
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

  -- Motor de stickers: selección ponderada según campaign_stickers.probability
  select coalesce(sum(probability), 0) into v_total_weight
  from public.campaign_stickers
  where campaign_id = v_campaign.id and status = 'active';

  if v_total_weight <= 0 then
    insert into public.scan_events (business_id, customer_id, qr_token_id, campaign_id, success, failure_reason)
    values (v_qr.business_id, p_customer_id, v_qr.id, v_qr.campaign_id, false, 'NO_STICKERS_CONFIGURED');
    return jsonb_build_object('success', false, 'error', 'NO_STICKERS_CONFIGURED');
  end if;

  v_rand := random() * v_total_weight;

  for rec in
    select sticker_id, probability
    from public.campaign_stickers
    where campaign_id = v_campaign.id and status = 'active'
    order by sticker_id
  loop
    v_cumulative := v_cumulative + rec.probability;
    if v_rand <= v_cumulative then
      v_sticker_id := rec.sticker_id;
      exit;
    end if;
  end loop;

  if v_sticker_id is null then
    select sticker_id into v_sticker_id
    from public.campaign_stickers
    where campaign_id = v_campaign.id and status = 'active'
    order by probability desc limit 1;
  end if;

  select * into v_sticker from public.stickers where id = v_sticker_id;

  select exists(
    select 1 from public.customer_stickers
    where customer_id = p_customer_id and campaign_id = v_campaign.id and sticker_id = v_sticker_id
  ) into v_is_duplicate;

  insert into public.customer_stickers (customer_id, campaign_id, sticker_id, qr_token_id, is_duplicate)
  values (p_customer_id, v_campaign.id, v_sticker_id, v_qr.id, v_is_duplicate);

  update public.qr_tokens
  set status = 'USED', used_at = now(), used_by = p_customer_id
  where id = v_qr.id;

  insert into public.scan_events (business_id, customer_id, qr_token_id, campaign_id, sticker_id, success)
  values (v_qr.business_id, p_customer_id, v_qr.id, v_campaign.id, v_sticker_id, true);

  select count(distinct sticker_id) into v_obtained_count
  from public.customer_stickers
  where customer_id = p_customer_id and campaign_id = v_campaign.id;

  if v_obtained_count >= v_campaign.completion_target then
    select * into v_prize from public.prizes
    where campaign_id = v_campaign.id and status = 'active'
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
    'sticker', jsonb_build_object(
      'id', v_sticker.id,
      'name', v_sticker.name,
      'emoji', v_sticker.emoji,
      'rarity', v_sticker.rarity
    ),
    'isDuplicate', v_is_duplicate,
    'obtainedCount', v_obtained_count,
    'completionTarget', v_campaign.completion_target,
    'prizeUnlocked', coalesce(v_prize_unlocked, false)
  );
end;
$$;

-- Solo el backend (service_role) puede ejecutar esta función.
-- Ni anon ni authenticated pueden invocarla directo desde el navegador.
revoke execute on function public.redeem_qr_token(text, uuid) from public, anon, authenticated;
grant execute on function public.redeem_qr_token(text, uuid) to service_role;
