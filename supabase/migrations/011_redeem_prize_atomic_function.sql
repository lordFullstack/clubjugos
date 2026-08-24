-- Función atómica de canje: el cliente nunca marca directamente un premio
-- como usado. Se valida todo en el servidor y se bloquea la fila para
-- evitar que un doble tap canjee el mismo premio dos veces.
create or replace function public.redeem_prize(
  p_customer_prize_id uuid,
  p_customer_id uuid,
  p_operator_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cp record;
  v_prize record;
begin
  select * into v_cp
  from public.customer_prizes
  where id = p_customer_prize_id
  for update;

  if not found or v_cp.customer_id <> p_customer_id then
    return jsonb_build_object('success', false, 'error', 'PRIZE_NOT_FOUND');
  end if;

  if v_cp.status = 'REDEEMED' then
    return jsonb_build_object('success', false, 'error', 'PRIZE_ALREADY_REDEEMED');
  end if;

  if v_cp.status = 'EXPIRED' or (v_cp.expires_at is not null and v_cp.expires_at < now()) then
    update public.customer_prizes set status = 'EXPIRED' where id = v_cp.id;
    return jsonb_build_object('success', false, 'error', 'PRIZE_EXPIRED');
  end if;

  select * into v_prize from public.prizes where id = v_cp.prize_id;

  update public.customer_prizes
  set status = 'REDEEMED', redeemed_at = now()
  where id = v_cp.id;

  insert into public.redemptions (customer_id, prize_id, operator_id)
  values (p_customer_id, v_cp.prize_id, p_operator_id);

  return jsonb_build_object(
    'success', true,
    'prizeName', v_prize.name
  );
end;
$$;

revoke execute on function public.redeem_prize(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.redeem_prize(uuid, uuid, uuid) to service_role;
