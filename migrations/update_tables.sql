-- Enable UUID extension first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add new columns to customer_details if they don't exist
DO $$ 
BEGIN
    -- Add role column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='customer_details' AND column_name='role') THEN
        ALTER TABLE customer_details ADD COLUMN role TEXT DEFAULT 'customer';
    END IF;

    -- Add is_approved column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='customer_details' AND column_name='is_approved') THEN
        ALTER TABLE customer_details ADD COLUMN is_approved BOOLEAN DEFAULT false;
    END IF;

    -- Add business related columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='customer_details' AND column_name='business_name') THEN
        ALTER TABLE customer_details ADD COLUMN business_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='customer_details' AND column_name='business_address') THEN
        ALTER TABLE customer_details ADD COLUMN business_address TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='customer_details' AND column_name='business_description') THEN
        ALTER TABLE customer_details ADD COLUMN business_description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='customer_details' AND column_name='has_existing_properties') THEN
        ALTER TABLE customer_details ADD COLUMN has_existing_properties BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='customer_details' AND column_name='existing_properties_details') THEN
        ALTER TABLE customer_details ADD COLUMN existing_properties_details TEXT;
    END IF;

    -- Add role constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage 
                  WHERE table_name='customer_details' AND constraint_name='check_valid_role') THEN
        ALTER TABLE customer_details 
        ADD CONSTRAINT check_valid_role 
        CHECK (role IN ('customer', 'property_owner', 'admin'));
    END IF;

EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error adding columns to customer_details: %', SQLERRM;
END $$;

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    firebase_uid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (firebase_uid) REFERENCES customer_details(firebase_uid)
);

-- Create properties table if it doesn't exist
CREATE TABLE IF NOT EXISTS properties (
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

-- Add status constraint to properties if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage 
                  WHERE table_name='properties' AND constraint_name='check_valid_status') THEN
        ALTER TABLE properties 
        ADD CONSTRAINT check_valid_status 
        CHECK (status IN ('pending_approval', 'approved', 'rejected', 'inactive'));
    END IF;
END $$;

-- Create rooms table if it doesn't exist
CREATE TABLE IF NOT EXISTS rooms (
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

-- Add status constraint to rooms if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage 
                  WHERE table_name='rooms' AND constraint_name='check_valid_room_status') THEN
        ALTER TABLE rooms 
        ADD CONSTRAINT check_valid_room_status 
        CHECK (status IN ('available', 'booked', 'maintenance', 'inactive'));
    END IF;
END $$;

-- Create bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS bookings (
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

-- Add status constraint to bookings if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage 
                  WHERE table_name='bookings' AND constraint_name='check_valid_booking_status') THEN
        ALTER TABLE bookings 
        ADD CONSTRAINT check_valid_booking_status 
        CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));
    END IF;
END $$;

-- Create indexes if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_properties_owner_id') THEN
        CREATE INDEX idx_properties_owner_id ON properties(owner_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_rooms_property_id') THEN
        CREATE INDEX idx_rooms_property_id ON rooms(property_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bookings_customer_id') THEN
        CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bookings_room_id') THEN
        CREATE INDEX idx_bookings_room_id ON rooms(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_customer_details_role') THEN
        CREATE INDEX idx_customer_details_role ON customer_details(role);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_customer_details_is_approved') THEN
        CREATE INDEX idx_customer_details_is_approved ON customer_details(is_approved);
    END IF;
END $$;

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_customer_details_updated_at') THEN
        CREATE TRIGGER update_customer_details_updated_at
            BEFORE UPDATE ON customer_details
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_admin_users_updated_at') THEN
        CREATE TRIGGER update_admin_users_updated_at
            BEFORE UPDATE ON admin_users
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_properties_updated_at') THEN
        CREATE TRIGGER update_properties_updated_at
            BEFORE UPDATE ON properties
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_rooms_updated_at') THEN
        CREATE TRIGGER update_rooms_updated_at
            BEFORE UPDATE ON rooms
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bookings_updated_at') THEN
        CREATE TRIGGER update_bookings_updated_at
            BEFORE UPDATE ON bookings
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$; 