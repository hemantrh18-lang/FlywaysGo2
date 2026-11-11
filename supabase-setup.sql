-- FlywaysGo starter database schema.
-- Run this in Supabase Dashboard > SQL Editor for your NEW project.
create extension if not exists pgcrypto;

create table if not exists public.flight_deals (
  id uuid primary key default gen_random_uuid(),
  origin text not null,
  destination text not null,
  airline text,
  travel_date text,
  indicative_fare numeric(12,2) not null check (indicative_fare > 0),
  discount_label text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  trip_type text not null check (trip_type in ('One-way','Round trip')),
  origin text not null,
  destination text not null,
  departure_date date not null,
  return_date date,
  adults integer not null default 1 check (adults between 1 and 9),
  children integer not null default 0 check (children between 0 and 4),
  infants integer not null default 0 check (infants between 0 and 3),
  customer_name text not null,
  phone text not null,
  email text,
  notes text,
  consent boolean not null default false,
  status text not null default 'new',
  confirmed_fare numeric(12,2),
  payment_status text not null default 'pending',
  pnr text,
  ticket_number text,
  created_at timestamptz not null default now()
);

alter table public.flight_deals enable row level security;
alter table public.booking_requests enable row level security;

-- Public can read only active deals.
drop policy if exists "Public read active deals" on public.flight_deals;
create policy "Public read active deals" on public.flight_deals
for select to anon, authenticated using (active = true);

-- Public can submit booking requests, but cannot read or edit requests.
drop policy if exists "Public submit booking requests" on public.booking_requests;
create policy "Public submit booking requests" on public.booking_requests
for insert to anon, authenticated
with check (consent = true);

-- Only authenticated admin users can manage deals.
drop policy if exists "Authenticated manage deals" on public.flight_deals;
create policy "Authenticated manage deals" on public.flight_deals
for all to authenticated
using (true) with check (true);

-- Only authenticated admin users can view and manage booking requests.
drop policy if exists "Authenticated manage booking requests" on public.booking_requests;
create policy "Authenticated manage booking requests" on public.booking_requests
for all to authenticated
using (true) with check (true);

-- IMPORTANT:
-- For production, restrict authenticated access to a dedicated admin role/user.
-- Do not expose the service_role key in website files.
-- Do not store card details, UPI PINs, passwords, passport scans, or agent login credentials here.
