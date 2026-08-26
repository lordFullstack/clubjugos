-- Nueva dinámica de stickers:
--   COLLECTIBLE: los del álbum. Se sortean SIN repetición hasta que el
--     cliente los tenga todos (garantiza que cada escaneo dé un sticker
--     nuevo mientras falten). campaign_stickers.probability se ignora
--     para este tipo.
--   SPECIAL: premios especiales de baja probabilidad ("cae" o no cae).
--     campaign_stickers.probability pasa a ser la tasa de caída real en %
--     (0-100), evaluada de forma independiente en cada escaneo, y no
--     cuenta para completar el álbum. Puede vincularse a un premio propio
--     vía special_prize_id.
create type public.sticker_kind as enum ('COLLECTIBLE', 'SPECIAL');

alter table public.stickers
  add column kind public.sticker_kind not null default 'COLLECTIBLE',
  add column special_prize_id uuid references public.prizes(id) on delete set null;

comment on column public.campaign_stickers.probability is
  'COLLECTIBLE: ignorado (sorteo sin repetición entre los pendientes). SPECIAL: tasa de caída real en %, evaluada de forma independiente en cada escaneo.';

comment on column public.stickers.special_prize_id is
  'Solo aplica cuando kind = SPECIAL. Premio que se otorga automáticamente si este sticker cae.';
