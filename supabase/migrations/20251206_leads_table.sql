-- Create leads table for Offline Guide Factory
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  phone text not null,
  name text,
  city_slug text,
  lead_type text default 'offline_guide',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.leads enable row level security;

-- Create policy for public insert (anyone can submit a lead)
create policy "Allow public insert to leads"
  on public.leads for insert
  with check (true);

-- Create policy for admin select (only admins can read leads)
-- Assuming admin_users table exists and is used for auth checks
create policy "Allow admin read leads"
  on public.leads for select
  using (
    exists (
      select 1 from public.admin_users
      where id = auth.uid()
    )
  );
