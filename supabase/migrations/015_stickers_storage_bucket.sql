-- Bucket público para las imágenes de stickers que sube el admin. Al ser
-- público, los archivos se sirven por URL directa sin necesidad de firmar
-- ni pasar por RLS en cada descarga. Las subidas solo las hace el server
-- action del admin usando el cliente de service_role (que ya evita RLS),
-- así que no hace falta una policy de INSERT para "authenticated"/"anon".
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'stickers',
  'stickers',
  true,
  5242880, -- 5 MB
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;
