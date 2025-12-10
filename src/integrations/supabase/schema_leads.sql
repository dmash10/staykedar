
-- Create specific types for enums
create type lead_status as enum ('New', 'Contacted', 'Proposal Sent', 'Follow Up', 'Converted', 'Lost');
create type lead_source as enum ('Website', 'WhatsApp', 'Referral', 'Manual');

-- Create the leads table
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  customer_name text not null,
  contact_number text not null,
  email text,
  
  status lead_status default 'New'::lead_status,
  source lead_source default 'Manual'::lead_source,
  
  pax int default 2,
  budget numeric,
  travel_date date,
  
  assigned_to uuid references auth.users(id),
  notes text,
  last_action text
);

-- RLS Policies
alter table public.leads enable row level security;

create policy "Enable read access for authenticated users"
on public.leads for select
to authenticated
using (true);

create policy "Enable insert access for authenticated users"
on public.leads for insert
to authenticated
with check (true);

create policy "Enable update access for authenticated users"
on public.leads for update
to authenticated
using (true);
