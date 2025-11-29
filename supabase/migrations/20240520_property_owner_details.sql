-- Create property_owner_details table
CREATE TABLE IF NOT EXISTS public.property_owner_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT NOT NULL UNIQUE REFERENCES customer_details(firebase_uid) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_address TEXT NOT NULL,
  business_description TEXT NOT NULL,
  business_license TEXT,
  tax_id TEXT,
  has_existing_properties BOOLEAN DEFAULT false,
  existing_properties_details TEXT,
  profile_complete BOOLEAN DEFAULT false,
  verification_documents JSONB,
  verification_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to update the updated_at column
CREATE TRIGGER update_property_owner_details_timestamp
BEFORE UPDATE ON public.property_owner_details
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Add RLS policies for property_owner_details
ALTER TABLE public.property_owner_details ENABLE ROW LEVEL SECURITY;

-- Users can view their own details
CREATE POLICY "Users can view their own property owner details" 
  ON public.property_owner_details 
  FOR SELECT 
  USING (firebase_uid = auth.uid());

-- Users can update their own details
CREATE POLICY "Users can update their own property owner details" 
  ON public.property_owner_details 
  FOR UPDATE 
  USING (firebase_uid = auth.uid());

-- Only admins can verify property owners (update verification status)
CREATE POLICY "Admins can verify property owners" 
  ON public.property_owner_details 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.firebase_uid = auth.uid()
    )
  );

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_property_owner_details_firebase_uid ON public.property_owner_details(firebase_uid); 