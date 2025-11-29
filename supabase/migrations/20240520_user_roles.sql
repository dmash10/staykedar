-- Create enum type for user roles
CREATE TYPE user_role AS ENUM ('customer', 'property_owner', 'admin');

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'customer',
  is_approved BOOLEAN DEFAULT false,
  approval_date TIMESTAMP WITH TIME ZONE,
  approved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_roles_timestamp
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Add RLS policies
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own role
CREATE POLICY "Users can view their own role" 
  ON public.user_roles 
  FOR SELECT 
  USING (firebase_uid = auth.uid());

-- Only admins can update roles and approve property owners
CREATE POLICY "Admins can manage all roles" 
  ON public.user_roles 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.firebase_uid = auth.uid()
    )
  );

-- Create function to check if a user is a property owner
CREATE OR REPLACE FUNCTION public.is_property_owner(uid text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE firebase_uid = uid 
    AND role = 'property_owner'
    AND is_approved = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(uid text)
RETURNS TEXT AS $$
DECLARE
  user_role_value TEXT;
BEGIN
  -- First check if user is admin (higher priority)
  IF EXISTS (SELECT 1 FROM public.admin_users WHERE firebase_uid = uid) THEN
    RETURN 'admin';
  END IF;
  
  -- Then check other roles
  SELECT role::TEXT INTO user_role_value
  FROM public.user_roles
  WHERE firebase_uid = uid;
  
  -- Default to customer if no role found
  RETURN COALESCE(user_role_value, 'customer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policy to properties table to ensure only owners can modify their properties
ALTER TABLE IF EXISTS public.properties 
ADD CONSTRAINT properties_owner_id_fkey 
FOREIGN KEY (owner_id) 
REFERENCES customer_details(firebase_uid) 
ON DELETE CASCADE;

-- Update properties RLS policy to restrict editing to owners or admins
CREATE POLICY IF NOT EXISTS "Property owners can manage their properties" 
  ON public.properties 
  FOR ALL 
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.firebase_uid = auth.uid()
    )
  );

-- Allow all to view all properties
CREATE POLICY IF NOT EXISTS "Anyone can view properties" 
  ON public.properties 
  FOR SELECT 
  TO authenticated, anon;

-- Update rooms RLS policy
CREATE POLICY IF NOT EXISTS "Property owners can manage their rooms" 
  ON public.rooms 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE properties.id = rooms.property_id
      AND properties.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.firebase_uid = auth.uid()
    )
  );

-- Allow all to view all rooms
CREATE POLICY IF NOT EXISTS "Anyone can view rooms" 
  ON public.rooms 
  FOR SELECT 
  TO authenticated, anon; 