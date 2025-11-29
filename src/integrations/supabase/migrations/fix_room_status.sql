-- Fix room status script
-- This script updates all rooms to have a status of 'available' where status is NULL or not set

-- First, ensure all rooms have a status
UPDATE rooms 
SET 
  status = 'available',
  last_status_update = NOW(),
  updated_at = NOW()
WHERE status IS NULL OR status = '';

-- Make sure we have the proper triggers and functions
-- Re-create the function to find available rooms
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

-- Re-create the function to check room availability
CREATE OR REPLACE FUNCTION check_room_availability(
  room_id UUID,
  check_in DATE,
  check_out DATE
) RETURNS BOOLEAN AS $$
DECLARE
  conflicting_bookings INT;
  room_status TEXT;
BEGIN
  -- Get room status
  SELECT status INTO room_status FROM rooms WHERE id = room_id;
  
  -- If room is not available, return false
  IF room_status != 'available' THEN
    RETURN FALSE;
  END IF;
  
  -- Check for conflicting bookings
  SELECT COUNT(*) INTO conflicting_bookings
  FROM bookings
  WHERE bookings.room_id = check_room_availability.room_id
  AND bookings.status != 'cancelled'
  AND (
    (bookings.check_in_date <= check_in_date AND bookings.check_out_date > check_in_date) OR
    (bookings.check_in_date < check_out_date AND bookings.check_out_date >= check_out_date) OR
    (bookings.check_in_date >= check_in_date AND bookings.check_out_date <= check_out_date)
  );
  
  RETURN conflicting_bookings = 0;
END;
$$ LANGUAGE plpgsql;

-- Print a summary of room status
SELECT status, COUNT(*) as count
FROM rooms
GROUP BY status
ORDER BY count DESC; 