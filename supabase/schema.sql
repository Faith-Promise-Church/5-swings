create extension if not exists pgcrypto;

create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  campus text not null check (
    campus in (
      'Pellissippi',
      'Blount',
      'North Knox',
      'Anderson',
      'Farragut',
      'Bristol',
      'Roane',
      'Central',
      'Promesa de Fe'
    )
  ),
  area text not null check (
    area in (
      'Admin',
      'Kids',
      'Students',
      'Groups',
      'Worship',
      'Guest Services',
      'Central Ministries',
      'Central Ops',
      'Campus Pastors',
      'SLT'
    )
  ),
  pin_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.swings (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff (id) on delete cascade,
  swing_1 text not null,
  swing_2 text not null,
  swing_3 text not null,
  swing_4 text not null,
  swing_5 text not null,
  wins_1 jsonb,
  wins_2 jsonb,
  wins_3 jsonb,
  wins_4 jsonb,
  wins_5 jsonb,
  created_at timestamptz not null default now(),
  is_current boolean not null default true
);

create index if not exists swings_staff_id_idx on public.swings (staff_id);
create index if not exists swings_current_idx on public.swings (staff_id, is_current);

alter table public.staff disable row level security;
alter table public.swings disable row level security;
