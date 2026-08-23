-- Crea automáticamente una fila en profiles cuando alguien se registra en Supabase Auth.
-- El rol SIEMPRE se fuerza a CUSTOMER acá, sin importar qué venga en los metadatos:
-- el registro público nunca debe poder auto-asignarse ADMIN u OPERATOR.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Cliente'),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    new.email,
    'CUSTOMER'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helpers SECURITY DEFINER para evitar recursión infinita en las policies de RLS
-- (si una policy de profiles consultara profiles directamente, se recursiona).
create function public.current_role()
returns public.user_role
language sql security definer stable set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create function public.current_business_id()
returns uuid
language sql security definer stable set search_path = public as $$
  select business_id from public.profiles where id = auth.uid();
$$;

-- RLS: businesses y profiles
alter table public.businesses enable row level security;
alter table public.profiles enable row level security;

create policy "businesses_select_own" on public.businesses
  for select using (id = public.current_business_id());

create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_select_staff_same_business" on public.profiles
  for select using (
    public.current_role() in ('ADMIN','OPERATOR')
    and business_id = public.current_business_id()
  );

-- El cliente solo puede actualizar su propia fila, y solo columnas de contacto:
-- nunca su propio rol ni su business_id (eso evita auto-escalar privilegios).
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

revoke update on public.profiles from authenticated;
grant update (name, phone, avatar_url) on public.profiles to authenticated;
