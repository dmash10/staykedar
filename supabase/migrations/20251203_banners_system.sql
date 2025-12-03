-- =====================================================
-- Professional Banner Management System - Database Schema
-- =====================================================
-- Created: 2025-12-03
-- Purpose: Complete banner management with analytics and targeting
-- =====================================================

-- =====================================================
-- 1. STORAGE BUCKET FOR BANNER IMAGES
-- =====================================================

-- Create storage bucket for banner images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banner-images',
  'banner-images',
  true, -- Public access for banners
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
-- Allow public read access
CREATE POLICY "Public banner images are readable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banner-images');

-- Allow authenticated users to upload (admins only in practice)
CREATE POLICY "Authenticated users can upload banner images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'banner-images' 
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update banner images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'banner-images' 
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete banner images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'banner-images' 
    AND auth.role() = 'authenticated'
  );

-- =====================================================
-- 2. BANNERS TABLE
-- =====================================================

-- Drop existing tables to ensure clean schema
DROP TABLE IF EXISTS public.banner_targeting CASCADE;
DROP TABLE IF EXISTS public.banner_analytics CASCADE;
DROP TABLE IF EXISTS public.banners CASCADE;

CREATE TABLE IF NOT EXISTS public.banners (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content Fields
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  link_text TEXT DEFAULT 'Learn More',
  
  -- Positioning & Display
  position TEXT NOT NULL DEFAULT 'homepage',
  display_order INTEGER NOT NULL DEFAULT 0,
  
  -- Styling
  background_color TEXT,
  text_color TEXT,
  
  -- Status & Scheduling
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  
  -- Targeting
  target_devices TEXT[] DEFAULT ARRAY['desktop', 'mobile', 'tablet'],
  target_pages TEXT[] DEFAULT ARRAY['*'], -- Wildcard for all pages
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT valid_position CHECK (
    position IN (
      'hero', 'homepage', 'sidebar', 'footer', 'popup',
      'inline', 'search', 'package', 'blog', 'destination', 'confirmation'
    )
  ),
  CONSTRAINT valid_dates CHECK (
    start_date IS NULL OR end_date IS NULL OR start_date < end_date
  ),
  CONSTRAINT valid_devices CHECK (
    target_devices <@ ARRAY['desktop', 'mobile', 'tablet']
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_banners_position ON public.banners(position);
CREATE INDEX IF NOT EXISTS idx_banners_is_active ON public.banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_display_order ON public.banners(display_order);
CREATE INDEX IF NOT EXISTS idx_banners_dates ON public.banners(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_banners_created_at ON public.banners(created_at DESC);

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_banners_updated_at
  BEFORE UPDATE ON public.banners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_banners_updated_at();

-- =====================================================
-- 3. BANNER ANALYTICS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.banner_analytics (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key
  banner_id UUID NOT NULL REFERENCES public.banners(id) ON DELETE CASCADE,
  
  -- Event Data
  event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Context
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  device_type TEXT,
  
  -- Session Tracking (to prevent duplicate impressions)
  session_id TEXT,
  
  -- User info (if available)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_banner_id ON public.banner_analytics(banner_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.banner_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON public.banner_analytics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON public.banner_analytics(session_id, banner_id);

-- =====================================================
-- 4. BANNER TARGETING TABLE (for advanced rules)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.banner_targeting (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key
  banner_id UUID NOT NULL REFERENCES public.banners(id) ON DELETE CASCADE,
  
  -- Targeting Rules
  rule_type TEXT NOT NULL CHECK (
    rule_type IN ('user_segment', 'geography', 'ab_test', 'custom')
  ),
  rule_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_targeting_banner_id ON public.banner_targeting(banner_id);
CREATE INDEX IF NOT EXISTS idx_targeting_rule_type ON public.banner_targeting(rule_type);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banner_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banner_targeting ENABLE ROW LEVEL SECURITY;

-- Banners: Public read for active banners
CREATE POLICY "Active banners are viewable by everyone"
  ON public.banners FOR SELECT
  USING (
    is_active = true 
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

-- Banners: Authenticated users can view all (for admin panel)
CREATE POLICY "Authenticated users can view all banners"
  ON public.banners FOR SELECT
  TO authenticated
  USING (true);

-- Banners: Only authenticated users can modify
CREATE POLICY "Authenticated users can insert banners"
  ON public.banners FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update banners"
  ON public.banners FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete banners"
  ON public.banners FOR DELETE
  TO authenticated
  USING (true);

-- Analytics: Anyone can submit analytics (for tracking)
CREATE POLICY "Anyone can insert analytics"
  ON public.banner_analytics FOR INSERT
  WITH CHECK (true);

-- Analytics: Only authenticated users can read
CREATE POLICY "Authenticated users can view analytics"
  ON public.banner_analytics FOR SELECT
  TO authenticated
  USING (true);

-- Targeting: Only authenticated users can manage
CREATE POLICY "Authenticated users can manage targeting"
  ON public.banner_targeting FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 6. DATABASE FUNCTIONS
-- =====================================================

-- Function: Get active banners for a position and page
CREATE OR REPLACE FUNCTION public.get_active_banners(
  p_position TEXT,
  p_page_url TEXT DEFAULT '/',
  p_device_type TEXT DEFAULT 'desktop'
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  subtitle TEXT,
  image_url TEXT,
  link_url TEXT,
  link_text TEXT,
  "position" TEXT,
  background_color TEXT,
  text_color TEXT,
  display_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.title,
    b.subtitle,
    b.image_url,
    b.link_url,
    b.link_text,
    b.position,
    b.background_color,
    b.text_color,
    b.display_order
  FROM public.banners b
  WHERE 
    b.is_active = true
    AND b.position = p_position
    AND (b.start_date IS NULL OR b.start_date <= NOW())
    AND (b.end_date IS NULL OR b.end_date >= NOW())
    AND p_device_type = ANY(b.target_devices)
    AND (
      '*' = ANY(b.target_pages) 
      OR p_page_url LIKE ANY(b.target_pages)
    )
  ORDER BY b.display_order ASC, b.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Record banner event (impression or click)
CREATE OR REPLACE FUNCTION public.record_banner_event(
  p_banner_id UUID,
  p_event_type TEXT,
  p_page_url TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_device_type TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
  v_existing_impression UUID;
BEGIN
  -- For impressions, check if already recorded in this session
  IF p_event_type = 'impression' AND p_session_id IS NOT NULL THEN
    SELECT id INTO v_existing_impression
    FROM public.banner_analytics
    WHERE 
      banner_id = p_banner_id
      AND session_id = p_session_id
      AND event_type = 'impression'
      AND timestamp > NOW() - INTERVAL '1 hour'
    LIMIT 1;
    
    -- If impression already exists, don't record again
    IF v_existing_impression IS NOT NULL THEN
      RETURN v_existing_impression;
    END IF;
  END IF;
  
  -- Record the event
  INSERT INTO public.banner_analytics (
    banner_id,
    event_type,
    page_url,
    session_id,
    user_agent,
    device_type,
    user_id,
    metadata
  ) VALUES (
    p_banner_id,
    p_event_type,
    p_page_url,
    p_session_id,
    p_user_agent,
    p_device_type,
    auth.uid(),
    p_metadata
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Get banner analytics summary
CREATE OR REPLACE FUNCTION public.get_banner_analytics(
  p_banner_id UUID DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  banner_id UUID,
  banner_title TEXT,
  total_impressions BIGINT,
  total_clicks BIGINT,
  ctr NUMERIC,
  unique_sessions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id AS banner_id,
    b.title AS banner_title,
    COUNT(*) FILTER (WHERE a.event_type = 'impression') AS total_impressions,
    COUNT(*) FILTER (WHERE a.event_type = 'click') AS total_clicks,
    CASE 
      WHEN COUNT(*) FILTER (WHERE a.event_type = 'impression') > 0 
      THEN ROUND(
        (COUNT(*) FILTER (WHERE a.event_type = 'click')::NUMERIC / 
         COUNT(*) FILTER (WHERE a.event_type = 'impression')::NUMERIC) * 100,
        2
      )
      ELSE 0
    END AS ctr,
    COUNT(DISTINCT a.session_id) AS unique_sessions
  FROM public.banners b
  LEFT JOIN public.banner_analytics a ON b.id = a.banner_id
    AND a.timestamp BETWEEN p_start_date AND p_end_date
  WHERE p_banner_id IS NULL OR b.id = p_banner_id
  GROUP BY b.id, b.title
  ORDER BY total_impressions DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 7. INITIAL DATA (DEMO BANNER)
-- =====================================================

-- Insert a sample banner for testing
INSERT INTO public.banners (
  title,
  subtitle,
  image_url,
  link_url,
  link_text,
  position,
  display_order,
  is_active,
  background_color,
  text_color,
  target_devices
) VALUES (
  '🎉 Welcome to StayKedarnath',
  'Book your spiritual journey with exclusive offers - Limited time discount!',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
  '/packages',
  'Explore Packages',
  'homepage',
  0,
  true,
  '#0071c2',
  '#ffffff',
  ARRAY['desktop', 'mobile', 'tablet']
) ON CONFLICT DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

COMMENT ON TABLE public.banners IS 'Promotional banners displayed across the website';
COMMENT ON TABLE public.banner_analytics IS 'Tracks impressions and clicks for banners';
COMMENT ON TABLE public.banner_targeting IS 'Advanced targeting rules for banners';
COMMENT ON FUNCTION public.get_active_banners IS 'Retrieves active banners based on position, page, and device';
COMMENT ON FUNCTION public.record_banner_event IS 'Records banner impression or click events with deduplication';
COMMENT ON FUNCTION public.get_banner_analytics IS 'Returns analytics summary for banners';
