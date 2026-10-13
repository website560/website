-- Voilà CMS: run once in Supabase → SQL Editor.
-- Creates the content table, a version history, and the public photo bucket.

create table if not exists public.sections (
  key        text primary key,          -- e.g. 'projects', 'films', 'reviews', 'team', 'history', 'press', 'instagram', 'site'
  data       jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.versions (
  id         bigint generated always as identity primary key,
  key        text not null,
  data       jsonb not null,
  note       text,
  created_at timestamptz not null default now()
);
create index if not exists versions_key_created_idx on public.versions (key, created_at desc);

-- The website reads content with the public (anon) key; only the server can write.
alter table public.sections enable row level security;
alter table public.versions enable row level security;
drop policy if exists "public read sections" on public.sections;
create policy "public read sections" on public.sections for select using (true);

-- Photos: a public bucket; uploads go through the admin API with the service key.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Admin accounts (email + password). Passwords are stored hashed; change them in the CMS Settings page.
create table if not exists public.admins (
  email         text primary key,
  password_hash text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.admins enable row level security;   -- no public access; only the server (service key) can read it

-- First account (the password was given to you in chat; change it in Settings after the first login)
insert into public.admins (email, password_hash)
values ('marketings@voila.sg', 'scrypt$16384$24458adfe6a1e0040f9580a968480cf1$4d54d5a9c329b0d58332021516504b81c92103675fd6c70eee292a09b36aa0613a480cbf19fc4d0bc4d08f11396bc4b38d192daae2864e07a721fc9bf7592a38')
on conflict (email) do nothing;
