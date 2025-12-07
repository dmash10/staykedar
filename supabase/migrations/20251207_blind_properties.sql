-- Create blind_properties table for Smart Stay Concierge
-- These are "blind" listings that hide the real hotel name from users

CREATE TABLE IF NOT EXISTS public.blind_properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  internal_name TEXT NOT NULL,           -- "Hotel Shiva" (admin only)
  display_name TEXT NOT NULL,            -- "Premium Valley Stay" (user-facing)
  location_slug TEXT NOT NULL,           -- "sonprayag"
  category TEXT DEFAULT 'standard' CHECK (category IN ('budget', 'standard', 'premium')),
  base_price INTEGER NOT NULL,
  surge_price INTEGER,                   -- May/June pricing
  amenities JSONB DEFAULT '{}',          -- {"geyser": "gas", "toilet": "western"}
  audit_notes TEXT,
  owner_phone TEXT,
  images TEXT[] DEFAULT '{}',
  zone_description TEXT,                 -- "500m from Shuttle Stand"
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  verification_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.blind_properties ENABLE ROW LEVEL SECURITY;

-- Public can read active properties
CREATE POLICY "Public read active properties"
  ON public.blind_properties FOR SELECT
  USING (is_active = true);

-- Admin can manage all properties
CREATE POLICY "Admin manage properties"
  ON public.blind_properties FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
    )
  );

-- Create index for faster location filtering
CREATE INDEX IF NOT EXISTS idx_blind_properties_location 
  ON public.blind_properties(location_slug);

CREATE INDEX IF NOT EXISTS idx_blind_properties_category 
  ON public.blind_properties(category);

-- Insert 5 dummy properties for initial testing
INSERT INTO public.blind_properties (internal_name, display_name, location_slug, category, base_price, surge_price, amenities, zone_description, pros, cons, audit_notes) VALUES
(
  'Hotel Kedar Inn',
  'Premium Valley View Stay',
  'guptkashi',
  'premium',
  3500,
  5000,
  '{"geyser": "gas", "toilet": "western", "parking": true, "wifi": true}',
  '200m from Vishwanath Temple',
  ARRAY['Gas geyser (24/7 hot water)', 'Western toilet', 'Mountain view from room', 'New mattresses (2024)'],
  ARRAY['100m uphill walk from parking', 'WiFi weak in rooms'],
  'Clean property, friendly staff. Best for families.'
),
(
  'Shiva Guest House',
  'Standard Pilgrim Lodge',
  'sonprayag',
  'standard',
  2000,
  3500,
  '{"geyser": "solar", "toilet": "indian", "parking": true}',
  '50m from Registration Counter',
  ARRAY['Very close to trek start', 'Cheap rates', 'Helpful owner'],
  ARRAY['Basic amenities only', 'Solar geyser (cold when cloudy)', '40 stairs to climb'],
  'Good budget option. Book for convenience, not luxury.'
),
(
  'Mountain View Resort',
  'Deluxe Mountain Retreat',
  'guptkashi',
  'premium',
  4500,
  7000,
  '{"geyser": "gas", "toilet": "western", "parking": true, "wifi": true, "restaurant": true}',
  'Near Phata Helipad Road',
  ARRAY['In-house restaurant', 'Spacious rooms', 'Generator backup', 'Room service'],
  ARRAY['15 min from main market', 'Slightly expensive'],
  'Best premium option in Guptkashi. Book for helicopter travelers.'
),
(
  'Kedarnath Guest House',
  'Budget Trek Base Stay',
  'gaurikund',
  'budget',
  1200,
  2500,
  '{"geyser": "solar", "toilet": "indian"}',
  '100m from Trek Starting Point',
  ARRAY['Closest to trek start', 'Very affordable', 'Hot chai available 4am'],
  ARRAY['Very basic rooms', 'Shared bathrooms', 'No parking nearby'],
  'For serious trekkers who want early start. Not for comfort seekers.'
),
(
  'Rudra Palace',
  'Comfort Stay with View',
  'phata',
  'standard',
  2800,
  4000,
  '{"geyser": "gas", "toilet": "western", "parking": true}',
  '500m from Helicopter Helipad',
  ARRAY['Close to helipad', 'Gas geyser', 'Good food available nearby'],
  ARRAY['Road noise during day', 'No room service'],
  'Ideal for helicopter pilgrims. Book night before flight.'
);
