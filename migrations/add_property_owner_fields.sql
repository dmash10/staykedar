-- Add new columns to customer_details table
ALTER TABLE customer_details
ADD COLUMN IF NOT EXISTS role text DEFAULT 'customer',
ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS business_name text,
ADD COLUMN IF NOT EXISTS business_address text,
ADD COLUMN IF NOT EXISTS business_description text,
ADD COLUMN IF NOT EXISTS has_existing_properties boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS existing_properties_details text;

-- Add status column to properties table if it doesn't exist
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending_approval';

-- Create an index on the role column for faster queries
CREATE INDEX IF NOT EXISTS idx_customer_details_role ON customer_details(role);

-- Create an index on the is_approved column for faster queries
CREATE INDEX IF NOT EXISTS idx_customer_details_is_approved ON customer_details(is_approved);

-- Add a constraint to ensure role is one of the valid values
ALTER TABLE customer_details
ADD CONSTRAINT valid_role CHECK (role IN ('customer', 'property_owner', 'admin')); 