-- Alisios DW · Runs
-- Esquema de la webapp de reservas (/runs) para un proyecto de Supabase.
-- Cómo usarlo: Supabase > SQL Editor > New query > pegar este archivo entero > Run. Se ejecuta una sola vez.
--
-- Qué crea
--   profiles          Ficha pública de cada rider: nombre, nivel, modalidades y si es organizador.
--   private_profiles  El teléfono. Solo lo lee su dueño y los organizadores.
--   runs              Los downwinds planificados.
--   signups           Quién va a cada run (el orden de llegada decide plaza o lista de espera).
--   messages          El chat de cada run y sus avisos automáticos (se apunta, se borra, cambia el estado).
--
-- Cuentas: la web registra a cada rider con un email interno "<teléfono>@tel.alisiosdownwind.com" y su contraseña.
-- Así no hace falta contratar SMS. La contraseña la guarda y comprueba Supabase Auth, nunca estas tablas.

-- ---------- Tablas ----------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 40),
  level smallint not null check (level between 1 and 3),
  modes text[] not null check (cardinality(modes) between 1 and 3 and modes <@ array['SUP foil', 'Parawing', 'Wing foil']),
  role text not null default 'rider' check (role in ('rider', 'organizer')),
  show_phone boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.private_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  phone text not null unique check (phone ~ '^\+[0-9]{8,15}$')
);

create table public.runs (
  id uuid primary key default gen_random_uuid(),
  day date not null,
  meet_time text not null check (meet_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  start_id text not null check (char_length(start_id) between 1 and 40),
  end_id text not null check (char_length(end_id) between 1 and 40),
  level smallint not null check (level between 1 and 3),
  modes text[] not null check (cardinality(modes) between 1 and 3 and modes <@ array['SUP foil', 'Parawing', 'Wing foil']),
  capacity smallint not null check (capacity between 2 and 40),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  wind_dir text not null default 'NE' check (wind_dir in ('N', 'NNE', 'NE', 'ENE', 'E')),
  wind_min smallint not null check (wind_min between 1 and 80),
  wind_max smallint not null check (wind_max between 1 and 80),
  meet text not null default '' check (char_length(meet) <= 120),
  logistics text not null default '' check (char_length(logistics) <= 300),
  notes text not null default '' check (char_length(notes) <= 400),
  km numeric(4, 1) check (km is null or km between 1 and 80),
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  check (end_id <> start_id),
  check (wind_max >= wind_min)
);

create index runs_day_idx on public.runs (day);

create table public.signups (
  run_id uuid not null references public.runs (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  mode text not null check (mode in ('SUP foil', 'Parawing', 'Wing foil')),
  -- -1: sin coche · 0: lleva coche sin plazas libres · 1 a 6: plazas libres que ofrece
  seats smallint not null default -1 check (seats between -1 and 6),
  created_at timestamptz not null default now(),
  primary key (run_id, user_id)
);

create table public.messages (
  id bigint generated always as identity primary key,
  run_id uuid not null references public.runs (id) on delete cascade,
  user_id uuid default auth.uid() references public.profiles (id) on delete set null,
  kind text not null default 'text'
    check (kind in ('text', 'join', 'leave', 'status-confirmed', 'status-pending', 'status-cancelled')),
  body text not null default '' check (char_length(body) <= 600),
  created_at timestamptz not null default now()
);

create index messages_run_idx on public.messages (run_id, created_at);

-- ---------- Funciones ----------

-- Día de hoy en Canarias: un run es "próximo" hasta que acaba su día
create function public.today_canary() returns date
language sql stable
set search_path = ''
as $$
  select (now() at time zone 'Atlantic/Canary')::date;
$$;

create function public.is_organizer() returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = (select auth.uid()) and role = 'organizer'
  );
$$;

-- Al crearse la cuenta en Supabase Auth, se crea su ficha con los datos del formulario de registro.
-- Si los datos no cumplen las reglas de la tabla, la cuenta no se crea.
create function public.handle_new_user() returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_modes text[];
begin
  -- Solo las cuentas que crea la webapp. Un usuario creado a mano en el panel no tiene ficha.
  if new.email is null or split_part(new.email, '@', 2) <> 'tel.alisiosdownwind.com' then
    return new;
  end if;

  select coalesce(array_agg(m), '{}')
    into v_modes
    from jsonb_array_elements_text(
      case when jsonb_typeof(meta -> 'modes') = 'array' then meta -> 'modes' else '[]'::jsonb end
    ) as m;

  insert into public.profiles (id, name, level, modes)
  values (new.id, btrim(coalesce(meta ->> 'name', '')), (meta ->> 'level')::smallint, v_modes);

  insert into public.private_profiles (id, phone)
  values (new.id, '+' || split_part(new.email, '@', 1));

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Avisos automáticos en el chat cuando alguien se apunta o se borra
create function public.log_signup() returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.messages (run_id, user_id, kind) values (new.run_id, new.user_id, 'join');
    return new;
  end if;

  -- Si lo que se borra es el run entero o la cuenta del rider, no hay nada que anotar
  if exists (select 1 from public.runs where id = old.run_id)
     and exists (select 1 from public.profiles where id = old.user_id) then
    insert into public.messages (run_id, user_id, kind) values (old.run_id, old.user_id, 'leave');
  end if;
  return old;
end;
$$;

create trigger signups_log
  after insert or delete on public.signups
  for each row execute function public.log_signup();

-- Aviso automático en el chat cuando los organizadores confirman, cancelan o devuelven a pendiente
create function public.log_run_status() returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    insert into public.messages (run_id, user_id, kind) values (new.id, null, 'status-' || new.status);
  end if;
  return new;
end;
$$;

create trigger runs_status_log
  after update of status on public.runs
  for each row execute function public.log_run_status();

-- Teléfonos de los riders de un run que han activado "mostrar mi WhatsApp".
-- Solo responde a quien está apuntado a ese mismo run o es organizador.
create function public.run_contacts(p_run uuid) returns table (user_id uuid, phone text)
language sql stable security definer
set search_path = ''
as $$
  select s.user_id, pp.phone
  from public.signups s
  join public.profiles p on p.id = s.user_id and p.show_phone
  join public.private_profiles pp on pp.id = s.user_id
  where s.run_id = p_run
    and s.user_id <> (select auth.uid())
    and (
      (select public.is_organizer())
      or exists (
        select 1 from public.signups mine
        where mine.run_id = p_run and mine.user_id = (select auth.uid())
      )
    );
$$;

-- Lo único que ve alguien sin cuenta: fecha, ruta y nivel de los tres próximos runs (pantalla de entrada).
-- La vista se salta a propósito las reglas de "runs" y solo enseña estas columnas.
create view public.runs_teaser as
  select id, day, start_id, end_id, level, modes, km
  from public.runs
  where status <> 'cancelled' and day >= public.today_canary()
  order by day, meet_time
  limit 3;

-- ---------- Permisos ----------
-- Primero se quita todo y luego se da solo lo necesario a cada tabla.

revoke all on public.profiles, public.private_profiles, public.runs, public.signups, public.messages, public.runs_teaser
  from anon, authenticated;

grant select on public.runs_teaser to anon, authenticated;

grant select on public.profiles to authenticated;
grant update (name, level, modes, show_phone) on public.profiles to authenticated;

grant select on public.private_profiles to authenticated;

grant select, insert, update, delete on public.runs to authenticated;

grant select, delete on public.signups to authenticated;
grant insert (run_id, mode, seats) on public.signups to authenticated;
grant update (mode, seats) on public.signups to authenticated;

grant select, delete on public.messages to authenticated;
grant insert (run_id, body) on public.messages to authenticated;

revoke execute on function public.run_contacts(uuid) from public, anon;
grant execute on function public.run_contacts(uuid) to authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.log_signup() from public, anon, authenticated;
revoke execute on function public.log_run_status() from public, anon, authenticated;

-- ---------- Reglas por fila (RLS) ----------

alter table public.profiles enable row level security;
alter table public.private_profiles enable row level security;
alter table public.runs enable row level security;
alter table public.signups enable row level security;
alter table public.messages enable row level security;

-- Fichas: cualquier rider con cuenta ve nombre, nivel y modalidades de los demás; cada uno edita la suya.
-- El rol no se puede cambiar desde la web: solo desde este panel (ver README).
create policy "Riders con cuenta ven las fichas" on public.profiles
  for select to authenticated using (true);

create policy "Cada rider edita su ficha" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Teléfonos: el propio y, para organizadores, todos
create policy "Telefono propio o de organizador" on public.private_profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_organizer()));

-- Runs: los ven todos los riders con cuenta; solo los organizadores los crean, editan y borran
create policy "Riders con cuenta ven los runs" on public.runs
  for select to authenticated using (true);

create policy "Organizadores crean runs" on public.runs
  for insert to authenticated
  with check ((select public.is_organizer()));

create policy "Organizadores editan runs" on public.runs
  for update to authenticated
  using ((select public.is_organizer()))
  with check ((select public.is_organizer()));

create policy "Organizadores borran runs" on public.runs
  for delete to authenticated
  using ((select public.is_organizer()));

-- Apuntados: se ven entre riders; cada uno se apunta, cambia y se borra a sí mismo.
-- No se admite apuntarse a un run cancelado o que ya ha pasado. Los organizadores pueden quitar a alguien.
create policy "Riders con cuenta ven quien va" on public.signups
  for select to authenticated using (true);

create policy "Cada rider se apunta a si mismo" on public.signups
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.runs r
      where r.id = run_id and r.status <> 'cancelled' and r.day >= public.today_canary()
    )
  );

create policy "Cada rider cambia su plaza" on public.signups
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Cada rider se borra y los organizadores moderan" on public.signups
  for delete to authenticated
  using (user_id = (select auth.uid()) or (select public.is_organizer()));

-- Chat: lo leen los riders con cuenta; cada uno escribe como sí mismo; los organizadores pueden borrar mensajes
create policy "Riders con cuenta leen el chat" on public.messages
  for select to authenticated using (true);

create policy "Cada rider escribe como si mismo" on public.messages
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and kind = 'text'
    and char_length(btrim(body)) > 0
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()))
  );

create policy "Organizadores borran mensajes" on public.messages
  for delete to authenticated
  using ((select public.is_organizer()));

-- ---------- Tiempo real ----------
-- La web escucha estos cambios para que apuntados y chat se actualicen solos.

alter publication supabase_realtime add table public.runs, public.signups, public.messages;
