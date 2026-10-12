-- ========================================================
-- Esquema para la tabla de turnos de recogidas (Supabase)
-- ========================================================

create table if not exists public.recogidas (
  id text primary key,                                 -- Clave única: {week_key}_{day}_{slot_id}
  week_key text not null,                              -- Semana ISO: ej. "2026-W42"
  day text not null,                                   -- monday, tuesday, wednesday, thursday, friday
  slot_id text not null,                               -- mediodia, tarde, o id personalizado
  assignee_name text not null,                         -- Nombre de quien recoge (ej. "Mario")
  assignee_color text,                                 -- Color distintivo en formato HEX
  assignee_avatar text,                                -- Icono o emoji (ej. "🚗", "👵")
  note text,                                           -- Nota opcional (ej. "Llevo a Lucas y Mateo")
  assigned_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security (RLS)
alter table public.recogidas enable row level security;

-- Política para que cualquier miembro con el enlace pueda leer y escribir libremente
create policy "Permitir lectura y escritura a colaboradores"
  on public.recogidas
  for all
  using (true)
  with check (true);

-- Habilitar suscripción en tiempo real (Supabase Realtime)
alter publication supabase_realtime add table public.recogidas;
