-- ============================================
-- CAR DRIVERS & TAXI BOOKING SYSTEM
-- Run this migration in Supabase SQL Editor
-- ============================================

-- 1. Create car_drivers table (Driver Profiles)
CREATE TABLE IF NOT EXISTS car_drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  photo TEXT,
  cover_image TEXT,
  bio TEXT,
  experience_years INT DEFAULT 0,
  languages TEXT[] DEFAULT '{"Hindi", "English"}',
  service_areas TEXT[] DEFAULT '{"Kedarnath", "Badrinath", "Char Dham"}',
  rating DECIMAL(2, 1) DEFAULT 5.0,
  total_trips INT DEFAULT 0,
  total_reviews INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  price_per_km DECIMAL(10, 2),
  base_city TEXT DEFAULT 'Rishikesh',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create car_vehicles table (Vehicles owned by drivers)
CREATE TABLE IF NOT EXISTS car_vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES car_drivers(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL, -- Sedan, SUV, Premium SUV, Tempo Traveller
  vehicle_name TEXT NOT NULL, -- Swift Dzire, Innova Crysta, etc.
  vehicle_number TEXT,
  capacity INT NOT NULL DEFAULT 4,
  luggage_capacity INT DEFAULT 2,
  features TEXT[] DEFAULT '{"AC", "Music System"}',
  images TEXT[] DEFAULT '{}',
  price_per_km DECIMAL(10, 2) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create car_routes table (Pre-defined routes with pricing)
CREATE TABLE IF NOT EXISTS car_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_city TEXT NOT NULL,
  to_city TEXT NOT NULL,
  distance_km INT NOT NULL,
  duration_hours DECIMAL(3, 1) NOT NULL,
  description TEXT,
  highlights TEXT[],
  image TEXT,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_city, to_city)
);

-- 4. Create car_route_pricing table (Route pricing per vehicle type)
CREATE TABLE IF NOT EXISTS car_route_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID NOT NULL REFERENCES car_routes(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL, -- Sedan, SUV, etc.
  one_way_price DECIMAL(10, 2) NOT NULL,
  round_trip_price DECIMAL(10, 2) NOT NULL,
  includes TEXT[] DEFAULT '{"Driver", "Fuel", "Tolls"}',
  excludes TEXT[] DEFAULT '{"Parking", "Night charges after 10PM"}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(route_id, vehicle_type)
);

-- 5. Create car_bookings table
CREATE TABLE IF NOT EXISTS car_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id TEXT UNIQUE NOT NULL, -- CAR-2024-XXXX format
  driver_id UUID REFERENCES car_drivers(id),
  vehicle_id UUID REFERENCES car_vehicles(id),
  route_id UUID REFERENCES car_routes(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  pickup_location TEXT NOT NULL,
  drop_location TEXT NOT NULL,
  pickup_date DATE NOT NULL,
  pickup_time TIME,
  return_date DATE,
  trip_type TEXT DEFAULT 'one_way', -- one_way, round_trip
  passengers INT DEFAULT 1,
  vehicle_type_requested TEXT,
  special_requests TEXT,
  estimated_price DECIMAL(10, 2),
  final_price DECIMAL(10, 2),
  status TEXT DEFAULT 'pending', -- pending, confirmed, in_progress, completed, cancelled
  payment_status TEXT DEFAULT 'unpaid', -- unpaid, partial, paid
  payment_amount DECIMAL(10, 2) DEFAULT 0,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create car_reviews table
CREATE TABLE IF NOT EXISTS car_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES car_drivers(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES car_bookings(id),
  customer_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Enable Row Level Security
ALTER TABLE car_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_route_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_reviews ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies - Public read access
CREATE POLICY "Car drivers are viewable by everyone" 
ON car_drivers FOR SELECT USING (is_active = true);

CREATE POLICY "Car vehicles are viewable by everyone" 
ON car_vehicles FOR SELECT USING (is_active = true);

CREATE POLICY "Car routes are viewable by everyone" 
ON car_routes FOR SELECT USING (is_active = true);

CREATE POLICY "Car route pricing is viewable by everyone" 
ON car_route_pricing FOR SELECT USING (is_active = true);

CREATE POLICY "Car reviews are viewable by everyone" 
ON car_reviews FOR SELECT USING (is_visible = true);

-- Admin policies (for authenticated users - you may want to restrict further)
CREATE POLICY "Admins can manage car drivers" 
ON car_drivers FOR ALL USING (true);

CREATE POLICY "Admins can manage car vehicles" 
ON car_vehicles FOR ALL USING (true);

CREATE POLICY "Admins can manage car routes" 
ON car_routes FOR ALL USING (true);

CREATE POLICY "Admins can manage car route pricing" 
ON car_route_pricing FOR ALL USING (true);

CREATE POLICY "Admins can manage car bookings" 
ON car_bookings FOR ALL USING (true);

CREATE POLICY "Admins can manage car reviews" 
ON car_reviews FOR ALL USING (true);

-- 9. Create indexes
CREATE INDEX IF NOT EXISTS car_drivers_slug_idx ON car_drivers(slug);
CREATE INDEX IF NOT EXISTS car_drivers_active_idx ON car_drivers(is_active);
CREATE INDEX IF NOT EXISTS car_drivers_featured_idx ON car_drivers(is_featured);
CREATE INDEX IF NOT EXISTS car_vehicles_driver_id_idx ON car_vehicles(driver_id);
CREATE INDEX IF NOT EXISTS car_routes_popular_idx ON car_routes(is_popular);
CREATE INDEX IF NOT EXISTS car_bookings_status_idx ON car_bookings(status);
CREATE INDEX IF NOT EXISTS car_bookings_driver_id_idx ON car_bookings(driver_id);
CREATE INDEX IF NOT EXISTS car_reviews_driver_id_idx ON car_reviews(driver_id);

-- 10. Function to generate booking ID
CREATE OR REPLACE FUNCTION generate_car_booking_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_id := 'CAR-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('car_booking_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for booking IDs
CREATE SEQUENCE IF NOT EXISTS car_booking_seq START 1001;

-- Create trigger
CREATE TRIGGER set_car_booking_id
BEFORE INSERT ON car_bookings
FOR EACH ROW
WHEN (NEW.booking_id IS NULL)
EXECUTE FUNCTION generate_car_booking_id();

-- 11. Function to update driver rating
CREATE OR REPLACE FUNCTION update_driver_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE car_drivers
  SET 
    rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM car_reviews WHERE driver_id = NEW.driver_id AND is_visible = true),
    total_reviews = (SELECT COUNT(*) FROM car_reviews WHERE driver_id = NEW.driver_id AND is_visible = true),
    updated_at = NOW()
  WHERE id = NEW.driver_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_review_insert
AFTER INSERT OR UPDATE ON car_reviews
FOR EACH ROW
EXECUTE FUNCTION update_driver_rating();

-- 12. Insert sample data (Popular Routes)
INSERT INTO car_routes (from_city, to_city, distance_km, duration_hours, is_popular, image) VALUES
('Delhi', 'Kedarnath (Sonprayag)', 460, 14, true, 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800'),
('Haridwar', 'Kedarnath (Sonprayag)', 250, 9, true, 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800'),
('Rishikesh', 'Kedarnath (Sonprayag)', 228, 8, true, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'),
('Dehradun', 'Kedarnath (Sonprayag)', 270, 10, true, 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800'),
('Delhi', 'Badrinath', 520, 15, true, NULL),
('Haridwar', 'Badrinath', 320, 10, true, NULL),
('Delhi', 'Char Dham Circuit', 1200, 48, true, NULL)
ON CONFLICT (from_city, to_city) DO NOTHING;

-- 13. Insert sample route pricing
INSERT INTO car_route_pricing (route_id, vehicle_type, one_way_price, round_trip_price, includes)
SELECT 
  r.id,
  v.vehicle_type,
  CASE v.vehicle_type 
    WHEN 'Sedan' THEN r.distance_km * 14
    WHEN 'SUV' THEN r.distance_km * 20
    WHEN 'Premium SUV' THEN r.distance_km * 28
    WHEN 'Tempo Traveller' THEN r.distance_km * 35
  END as one_way_price,
  CASE v.vehicle_type 
    WHEN 'Sedan' THEN r.distance_km * 12 * 2
    WHEN 'SUV' THEN r.distance_km * 18 * 2
    WHEN 'Premium SUV' THEN r.distance_km * 25 * 2
    WHEN 'Tempo Traveller' THEN r.distance_km * 32 * 2
  END as round_trip_price,
  ARRAY['Driver allowance', 'Fuel', 'State permits', 'Toll taxes']
FROM car_routes r
CROSS JOIN (VALUES ('Sedan'), ('SUV'), ('Premium SUV'), ('Tempo Traveller')) AS v(vehicle_type)
ON CONFLICT (route_id, vehicle_type) DO NOTHING;

-- 14. Timestamp update trigger
CREATE TRIGGER update_car_drivers_timestamp
BEFORE UPDATE ON car_drivers
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_car_vehicles_timestamp
BEFORE UPDATE ON car_vehicles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_car_routes_timestamp
BEFORE UPDATE ON car_routes
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_car_bookings_timestamp
BEFORE UPDATE ON car_bookings
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();


