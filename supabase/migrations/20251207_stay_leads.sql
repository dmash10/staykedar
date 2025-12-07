-- Create stay_leads table for Smart Stay Concierge
-- Tracks all availability requests from users

CREATE TABLE IF NOT EXISTS public.stay_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  property_id UUID REFERENCES public.blind_properties(id),
  location_slug TEXT,                    -- For urgent requests without specific property
  check_in DATE,
  check_out DATE,
  guests INTEGER DEFAULT 2,
  budget_category TEXT,                  -- budget | standard | premium
  is_urgent BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'ai_calling', 'contacted', 'confirmed', 'paid', 'cancelled')),
  notes TEXT,
  source TEXT DEFAULT 'website',         -- website | whatsapp | call
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.stay_leads ENABLE ROW LEVEL SECURITY;

-- Anyone can insert leads (public form submission)
CREATE POLICY "Public insert leads"
  ON public.stay_leads FOR INSERT
  WITH CHECK (true);

-- Admin can read and manage all leads
CREATE POLICY "Admin manage leads"
  ON public.stay_leads FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
    )
  );

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_stay_leads_status 
  ON public.stay_leads(status);

CREATE INDEX IF NOT EXISTS idx_stay_leads_created 
  ON public.stay_leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stay_leads_urgent 
  ON public.stay_leads(is_urgent) WHERE is_urgent = true;
