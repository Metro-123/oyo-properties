-- Run this entire file in Supabase Dashboard > SQL Editor > New query.
create extension if not exists pgcrypto;

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(), name text not null, email text, phone text,
  specialization text, avatar_initials text, verified boolean not null default false,
  listings_count integer not null default 0, created_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(), title text not null, type text not null,
  listing_type text not null check (listing_type in ('sale', 'rent')), price numeric not null,
  price_display text not null, location text not null, neighborhood text, beds integer not null default 0,
  baths integer not null default 0, sqft text, images text[] not null default '{}', description text,
  featured boolean not null default false, agent_id uuid references public.agents(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

alter table public.properties add column if not exists floor_count integer;
alter table public.properties add column if not exists owner_id uuid references auth.users(id) on delete set null;
alter table public.properties add column if not exists status text not null default 'published' check (status in ('pending', 'published', 'rejected'));
alter table public.properties add column if not exists amenities text[] not null default '{}';
alter table public.properties add column if not exists availability_text text;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade, full_name text, phone text,
  role text not null default 'seeker', company_name text, is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(), property_id uuid references public.properties(id) on delete set null,
  name text not null, email text not null, phone text, message text not null,
  status text not null default 'new', created_at timestamptz not null default now()
);

alter table public.inquiries add column if not exists user_id uuid references auth.users(id) on delete set null;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(), name text not null, email text not null,
  phone text, subject text, message text not null, created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public
as $$ select coalesce((select is_admin from public.user_profiles where id = auth.uid()), false) $$;

alter table public.agents enable row level security;
alter table public.properties enable row level security;
alter table public.user_profiles enable row level security;
alter table public.inquiries enable row level security;
alter table public.contact_messages enable row level security;

create policy "public can view agents" on public.agents for select using (true);
drop policy if exists "public can view properties" on public.properties;
create policy "public views published properties" on public.properties for select using (status = 'published');
create policy "owners view their own properties" on public.properties for select using (owner_id = auth.uid());
create policy "admins manage agents" on public.agents for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage properties" on public.properties for all using (public.is_admin()) with check (public.is_admin());
create policy "landlords submit listings" on public.properties for insert with check (
  owner_id = auth.uid()
  and status = 'pending'
  and exists (select 1 from public.user_profiles where id = auth.uid() and role = 'landlord')
);
create policy "owners update their pending listings" on public.properties for update using (
  owner_id = auth.uid() and status in ('pending', 'rejected')
) with check (
  owner_id = auth.uid() and status = 'pending'
);
create policy "owners delete their pending listings" on public.properties for delete using (
  owner_id = auth.uid() and status in ('pending', 'rejected')
);
create policy "users create their own profile" on public.user_profiles for insert with check (auth.uid() = id);
create policy "users view their own profile" on public.user_profiles for select using (auth.uid() = id);
create policy "users update their own profile" on public.user_profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "visitors submit inquiries" on public.inquiries for insert with check (true);
create policy "admins view inquiries" on public.inquiries for select using (public.is_admin());
drop policy if exists "users view own inquiries" on public.inquiries;
create policy "users view own inquiries" on public.inquiries for select using (user_id = auth.uid());
create policy "visitors submit contact messages" on public.contact_messages for insert with check (true);
create policy "admins view contact messages" on public.contact_messages for select using (public.is_admin());

insert into storage.buckets (id, name, public) values ('property-images', 'property-images', true)
on conflict (id) do nothing;
create policy "public can view property images" on storage.objects for select using (bucket_id = 'property-images');
drop policy if exists "admins upload property images" on storage.objects;
drop policy if exists "admins update property images" on storage.objects;
drop policy if exists "admins delete property images" on storage.objects;
create policy "admins upload property images" on storage.objects for insert with check (bucket_id = 'property-images' and public.is_admin());
create policy "landlords upload their property images" on storage.objects for insert with check (
  bucket_id = 'property-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (select 1 from public.user_profiles where id = auth.uid() and role = 'landlord')
);
create policy "owners delete their property images" on storage.objects for delete using (
  bucket_id = 'property-images' and (storage.foldername(name))[1] = auth.uid()::text
);
