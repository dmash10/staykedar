-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to check if a room is available for a date range
CREATE OR REPLACE FUNCTION check_room_availability(
  room_id UUID,
  check_in DATE,
  check_out DATE
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check if there are any overlapping bookings
  RETURN NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE 
      bookings.room_id = check_room_availability.room_id AND
      status NOT IN ('cancelled') AND
      (
        (check_in_date <= check_room_availability.check_in AND check_out_date > check_room_availability.check_in) OR
        (check_in_date < check_room_availability.check_out AND check_out_date >= check_room_availability.check_out) OR
        (check_in_date >= check_room_availability.check_in AND check_out_date <= check_room_availability.check_out)
      )
  );
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

-- Function to create a booking
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
BEGIN
  -- Check if room is available for the requested dates
  IF NOT check_room_availability(p_room_id, p_check_in_date, p_check_out_date) THEN
    RAISE EXCEPTION 'Room is not available for the requested dates';
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
    'pending'
  ) RETURNING id INTO v_booking_id;
  
  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql; 