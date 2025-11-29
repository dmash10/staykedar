-- 1. Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES customer_details(id),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  location GEOGRAPHY(POINT),
  amenities JSONB DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  capacity INT NOT NULL DEFAULT 2,
  room_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  last_status_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  images TEXT[] DEFAULT '{}',
  amenities JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customer_details(id),
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create status_logs table
CREATE TABLE IF NOT EXISTS status_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES customer_details(id),
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  update_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  update_type TEXT NOT NULL DEFAULT 'owner',
  notes TEXT
);

-- 5. Create room_availability table for efficient date-based queries
CREATE TABLE IF NOT EXISTS room_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  price_override DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, date)
);

-- 6. RLS Policies
-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_availability ENABLE ROW LEVEL SECURITY;

-- Property policies
CREATE POLICY "Properties are viewable by everyone" 
ON properties FOR SELECT USING (true);

CREATE POLICY "Properties can be created by owners" 
ON properties FOR INSERT WITH CHECK (
  auth.uid() = owner_id
);

CREATE POLICY "Properties can be updated by owners" 
ON properties FOR UPDATE USING (
  auth.uid() = owner_id
);

CREATE POLICY "Properties can be deleted by owners" 
ON properties FOR DELETE USING (
  auth.uid() = owner_id
);

-- Room policies
CREATE POLICY "Rooms are viewable by everyone" 
ON rooms FOR SELECT USING (true);

CREATE POLICY "Rooms can be created by property owners" 
ON rooms FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM properties p 
    WHERE p.id = property_id AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Rooms can be updated by property owners" 
ON rooms FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM properties p 
    WHERE p.id = property_id AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Rooms can be deleted by property owners" 
ON rooms FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM properties p 
    WHERE p.id = property_id AND p.owner_id = auth.uid()
  )
);

-- Booking policies
CREATE POLICY "Bookings are viewable by the customer or property owner" 
ON bookings FOR SELECT USING (
  auth.uid() = customer_id OR 
  EXISTS (
    SELECT 1 FROM rooms r 
    JOIN properties p ON r.property_id = p.id 
    WHERE r.id = room_id AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Bookings can be created by customers" 
ON bookings FOR INSERT WITH CHECK (
  auth.uid() = customer_id
);

CREATE POLICY "Bookings can be updated by the customer or property owner" 
ON bookings FOR UPDATE USING (
  auth.uid() = customer_id OR 
  EXISTS (
    SELECT 1 FROM rooms r 
    JOIN properties p ON r.property_id = p.id 
    WHERE r.id = room_id AND p.owner_id = auth.uid()
  )
);

-- Status logs policies
CREATE POLICY "Status logs are viewable by admins and the property owner" 
ON status_logs FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM rooms r 
    JOIN properties p ON r.property_id = p.id 
    WHERE r.id = room_id AND p.owner_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.firebase_uid = auth.uid()
  )
);

-- Room availability policies
CREATE POLICY "Room availability is viewable by everyone" 
ON room_availability FOR SELECT USING (true);

CREATE POLICY "Room availability can be updated by property owners" 
ON room_availability FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM rooms r 
    JOIN properties p ON r.property_id = p.id 
    WHERE r.id = room_id AND p.owner_id = auth.uid()
  )
);

-- 7. Create indexes for common queries
CREATE INDEX IF NOT EXISTS rooms_property_id_idx ON rooms(property_id);
CREATE INDEX IF NOT EXISTS bookings_room_id_idx ON bookings(room_id);
CREATE INDEX IF NOT EXISTS bookings_customer_id_idx ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS status_logs_room_id_idx ON status_logs(room_id);
CREATE INDEX IF NOT EXISTS room_availability_room_id_date_idx ON room_availability(room_id, date);
CREATE INDEX IF NOT EXISTS room_availability_date_idx ON room_availability(date);

-- 8. Create functions for common operations
-- Function to check if a room is available for a date range
CREATE OR REPLACE FUNCTION check_room_availability(
  room_id UUID,
  check_in DATE,
  check_out DATE
) RETURNS BOOLEAN AS $$
DECLARE
  is_available BOOLEAN;
BEGIN
  SELECT NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE bookings.room_id = $1
    AND bookings.status != 'cancelled'
    AND (
      ($2 >= bookings.check_in_date AND $2 < bookings.check_out_date) OR
      ($3 > bookings.check_in_date AND $3 <= bookings.check_out_date) OR
      ($2 <= bookings.check_in_date AND $3 >= bookings.check_out_date)
    )
  ) AND NOT EXISTS (
    SELECT 1 FROM room_availability
    WHERE room_availability.room_id = $1
    AND room_availability.date >= $2
    AND room_availability.date < $3
    AND room_availability.is_available = false
  ) INTO is_available;
  
  RETURN is_available;
END;
$$ LANGUAGE plpgsql;

-- Function to find available rooms for a date range
CREATE OR REPLACE FUNCTION find_available_rooms(
  check_in DATE,
  check_out DATE,
  capacity INT DEFAULT NULL,
  location_text TEXT DEFAULT NULL
) RETURNS TABLE (
  room_id UUID,
  property_id UUID,
  room_name TEXT,
  property_name TEXT,
  price DECIMAL(10, 2),
  room_capacity INT,
  room_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id as room_id,
    r.property_id,
    r.name as room_name,
    p.name as property_name,
    r.price,
    r.capacity as room_capacity,
    r.room_type
  FROM rooms r
  JOIN properties p ON r.property_id = p.id
  WHERE r.status = 'available'
  AND (capacity IS NULL OR r.capacity >= capacity)
  AND (location_text IS NULL OR 
       p.address ILIKE '%' || location_text || '%' OR
       p.name ILIKE '%' || location_text || '%')
  AND check_room_availability(r.id, check_in, check_out);
END;
$$ LANGUAGE plpgsql;

-- Function to update room status with logging
CREATE OR REPLACE FUNCTION update_room_status(
  p_room_id UUID,
  p_new_status TEXT,
  p_user_id UUID,
  p_update_type TEXT DEFAULT 'owner',
  p_notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_previous_status TEXT;
BEGIN
  -- Get current status
  SELECT status INTO v_previous_status
  FROM rooms
  WHERE id = p_room_id;
  
  -- Update room status
  UPDATE rooms
  SET 
    status = p_new_status,
    last_status_update = NOW(),
    updated_at = NOW()
  WHERE id = p_room_id;
  
  -- Log the status change
  INSERT INTO status_logs (
    room_id,
    user_id,
    previous_status,
    new_status,
    update_type,
    notes
  ) VALUES (
    p_room_id,
    p_user_id,
    v_previous_status,
    p_new_status,
    p_update_type,
    p_notes
  );
END;
$$ LANGUAGE plpgsql;

-- Function to create a booking and update availability
CREATE OR REPLACE FUNCTION create_booking(
  p_room_id UUID,
  p_customer_id UUID,
  p_check_in_date DATE,
  p_check_out_date DATE,
  p_total_price DECIMAL(10, 2),
  p_special_requests TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_booking_id UUID;
  v_current_date DATE;
BEGIN
  -- Check if room is available for the date range
  IF NOT check_room_availability(p_room_id, p_check_in_date, p_check_out_date) THEN
    RAISE EXCEPTION 'Room is not available for the selected dates';
  END IF;
  
  -- Create booking
  INSERT INTO bookings (
    room_id,
    customer_id,
    check_in_date,
    check_out_date,
    total_price,
    special_requests,
    status
  ) VALUES (
    p_room_id,
    p_customer_id,
    p_check_in_date,
    p_check_out_date,
    p_total_price,
    p_special_requests,
    'confirmed'
  ) RETURNING id INTO v_booking_id;
  
  -- Update room availability for each date in the range
  v_current_date := p_check_in_date;
  WHILE v_current_date < p_check_out_date LOOP
    INSERT INTO room_availability (
      room_id,
      date,
      is_available
    ) VALUES (
      p_room_id,
      v_current_date,
      false
    )
    ON CONFLICT (room_id, date) DO UPDATE
    SET 
      is_available = false,
      updated_at = NOW();
    
    v_current_date := v_current_date + INTERVAL '1 day';
  END LOOP;
  
  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Create triggers for maintaining data integrity
-- Trigger to update room status when a booking is made or cancelled
CREATE OR REPLACE FUNCTION update_room_status_on_booking() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    -- Check if the room should be marked as occupied (if check-in is today)
    IF NEW.check_in_date = CURRENT_DATE THEN
      PERFORM update_room_status(NEW.room_id, 'occupied', NEW.customer_id, 'system', 'Automatic status update due to new booking');
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If booking was cancelled, update availability
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
      DELETE FROM room_availability
      WHERE room_id = NEW.room_id
      AND date >= NEW.check_in_date
      AND date < NEW.check_out_date;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_booking_changes
AFTER INSERT OR UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_room_status_on_booking();

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_properties_timestamp
BEFORE UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_rooms_timestamp
BEFORE UPDATE ON rooms
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_bookings_timestamp
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_room_availability_timestamp
BEFORE UPDATE ON room_availability
FOR EACH ROW
EXECUTE FUNCTION update_timestamp(); 