-- Enable UUID extension first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- First, drop existing tables and triggers in the correct order (if they exist)
DO $$ 
BEGIN
    -- Drop triggers if they exist
    DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
    DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
    DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
    DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
    DROP TRIGGER IF EXISTS update_customer_details_updated_at ON customer_details;

    -- Drop tables if they exist
    DROP TABLE IF EXISTS bookings;
    DROP TABLE IF EXISTS rooms;
    DROP TABLE IF EXISTS properties;
    DROP TABLE IF EXISTS admin_users;
    DROP TABLE IF EXISTS customer_details;

    -- Drop function if exists
    DROP FUNCTION IF EXISTS update_updated_at_column();
EXCEPTION
    WHEN undefined_table THEN 
        -- Do nothing, continue with the script
END $$;

-- Now create tables in the correct order
-- First, create the customer_details table as it's referenced by others
CREATE TABLE customer_details (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    firebase_uid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT,
    role TEXT DEFAULT 'customer',
    is_approved BOOLEAN DEFAULT false,
    business_name TEXT,
    business_address TEXT,
    business_description TEXT,
    has_existing_properties BOOLEAN DEFAULT false,
    existing_properties_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add role constraint after table creation
ALTER TABLE customer_details 
ADD CONSTRAINT check_valid_role 
CHECK (role IN ('customer', 'property_owner', 'admin'));

-- Create admin_users table
CREATE TABLE admin_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    firebase_uid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (firebase_uid) REFERENCES customer_details(firebase_uid)
);

-- Create properties table
CREATE TABLE properties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    status TEXT DEFAULT 'pending_approval',
    amenities JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES customer_details(firebase_uid)
);

-- Add status constraint after table creation
ALTER TABLE properties 
ADD CONSTRAINT check_valid_status 
CHECK (status IN ('pending_approval', 'approved', 'rejected', 'inactive'));

-- Create rooms table
CREATE TABLE rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    room_type TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 1,
    amenities JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Add status constraint after table creation
ALTER TABLE rooms 
ADD CONSTRAINT check_valid_room_status 
CHECK (status IN ('available', 'booked', 'maintenance', 'inactive'));

-- Create bookings table
CREATE TABLE bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID NOT NULL,
    customer_id TEXT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    guest_count INTEGER NOT NULL DEFAULT 1,
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (customer_id) REFERENCES customer_details(firebase_uid)
);

-- Add status constraint after table creation
ALTER TABLE bookings 
ADD CONSTRAINT check_valid_booking_status 
CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));

-- Create indexes for better query performance
CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_rooms_property_id ON rooms(property_id);
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_room_id ON rooms(id);
CREATE INDEX idx_customer_details_role ON customer_details(role);
CREATE INDEX idx_customer_details_is_approved ON customer_details(is_approved);

-- Create function to update updated_at timestamp
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_customer_details_updated_at
    BEFORE UPDATE ON customer_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 