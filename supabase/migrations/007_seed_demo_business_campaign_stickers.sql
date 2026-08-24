-- Agrega un campo de emoji a los stickers (el diseño del MVP usa emoji como
-- arte del sticker, tal como muestran todos los mockups del spec, en vez de
-- depender de Supabase Storage para imágenes desde el día uno).
alter table public.stickers add column emoji text;

-- Negocio demo: "Pa' Comer"
insert into public.businesses (id, name, phone, status)
values ('11111111-1111-1111-1111-111111111111', 'Pa'' Comer', '3000000000', 'active');

-- Campaña demo: "Colección Sabores"
insert into public.campaigns (id, business_id, name, description, start_date, end_date, completion_target, status)
values (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Colección Sabores',
  'Junta los 8 sabores y gana un jugo gratis.',
  current_date,
  current_date + interval '60 days',
  8,
  'active'
);

-- 8 stickers demo
insert into public.stickers (id, name, description, emoji, rarity, base_probability, status) values
  ('33333333-0000-0000-0000-000000000001', 'Fresa',    'Sticker de fresa',    '🍓', 'COMMON',    25, 'active'),
  ('33333333-0000-0000-0000-000000000002', 'Mango',    'Sticker de mango',    '🥭', 'COMMON',    20, 'active'),
  ('33333333-0000-0000-0000-000000000003', 'Naranja',  'Sticker de naranja',  '🍊', 'COMMON',    15, 'active'),
  ('33333333-0000-0000-0000-000000000004', 'Piña',     'Sticker de piña',     '🍍', 'UNCOMMON',  15, 'active'),
  ('33333333-0000-0000-0000-000000000005', 'Limón',    'Sticker de limón',    '🍋', 'UNCOMMON',  10, 'active'),
  ('33333333-0000-0000-0000-000000000006', 'Patilla',  'Sticker de patilla',  '🍉', 'RARE',       8, 'active'),
  ('33333333-0000-0000-0000-000000000007', 'Kiwi',     'Sticker de kiwi',     '🥝', 'EPIC',       5, 'active'),
  ('33333333-0000-0000-0000-000000000008', 'Especial', 'Sticker especial',   '⭐', 'LEGENDARY',  2, 'active');

-- Relación campaña-sticker con las probabilidades reales de esta temporada
insert into public.campaign_stickers (campaign_id, sticker_id, probability, status)
select '22222222-2222-2222-2222-222222222222', id, base_probability, 'active'
from public.stickers;

-- Premio demo
insert into public.prizes (id, business_id, campaign_id, name, description, required_stickers, max_value, expires_days, status)
values (
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'Jugo gratis hasta $10.000',
  'Cambia tu colección completa por un jugo gratis en cualquier sucursal.',
  8,
  10000,
  30,
  'active'
);

-- A partir de ahora, todo registro nuevo se asigna automáticamente a este
-- negocio (el MVP es de una sola juguería; el spec de multi-negocio llega
-- después, seleccionando el negocio en el registro).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, business_id, name, phone, email, role)
  values (
    new.id,
    '11111111-1111-1111-1111-111111111111',
    coalesce(new.raw_user_meta_data->>'name', 'Cliente'),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    new.email,
    'CUSTOMER'
  );
  return new;
end;
$$;

-- Asigna el negocio a los clientes que ya se hayan registrado antes de este seed.
update public.profiles
set business_id = '11111111-1111-1111-1111-111111111111'
where business_id is null and role = 'CUSTOMER';
