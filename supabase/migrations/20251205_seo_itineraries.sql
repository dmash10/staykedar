-- Create seo_itineraries table
create table if not exists seo_itineraries (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  title text not null,
  duration_days integer not null,
  start_location text not null,
  end_location text default 'Kedarnath',
  overview text,
  day_wise_plan jsonb default '[]'::jsonb, -- Array of {day, title, description, activity, stay_location}
  inclusions text[] default array[]::text[],
  exclusions text[] default array[]::text[],
  price_estimate integer,
  
  -- SEO Fields
  meta_title text,
  meta_description text,
  
  -- Status
  is_active boolean default true,
  is_featured boolean default false,
  
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table seo_itineraries enable row level security;

-- Policies
create policy "Public itineraries are viewable by everyone"
  on seo_itineraries for select
  using (is_active = true);

create policy "Admins can do everything with itineraries"
  on seo_itineraries for all
  using (
    exists (
      select 1 from admin_users where admin_users.id = auth.uid()
    )
  );

-- Indexes for search performance
create index seo_itineraries_slug_idx on seo_itineraries (slug);
create index seo_itineraries_duration_idx on seo_itineraries (duration_days);
create index seo_itineraries_start_location_idx on seo_itineraries (start_location);

-- Function to update updated_at timestamp
create trigger update_seo_itineraries_updated_at
  before update on seo_itineraries
  for each row
  execute function update_updated_at_column();
