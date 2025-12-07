-- SEO Settings Table for Admin-Controlled SEO
-- Run this migration in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic SEO
  site_title TEXT DEFAULT 'StayKedarnath | Book Kedarnath Stays, Helicopter & Yatra Packages',
  site_description TEXT DEFAULT 'Official Kedarnath booking partner. Book verified stays, helicopter services from ₹2,500, VIP darshan, and Char Dham Yatra packages. Best prices guaranteed with 24/7 support.',
  site_keywords TEXT DEFAULT 'Kedarnath booking, Kedarnath hotel, Kedarnath helicopter, Char Dham Yatra, Kedarnath Temple, Kedarnath trek, Kedarnath stay',
  
  -- Open Graph
  og_image TEXT DEFAULT 'https://staykedarnath.in/og-image.png',
  og_site_name TEXT DEFAULT 'StayKedarnath',
  og_locale TEXT DEFAULT 'en_IN',
  
  -- Twitter
  twitter_handle TEXT DEFAULT '@staykedarnath',
  twitter_card_type TEXT DEFAULT 'summary_large_image',
  
  -- Technical SEO
  google_analytics_id TEXT,
  google_search_console_verification TEXT,
  bing_verification TEXT,
  canonical_base_url TEXT DEFAULT 'https://staykedarnath.in',
  
  -- Organization Schema (for JSON-LD)
  org_name TEXT DEFAULT 'StayKedarnath',
  org_phone TEXT DEFAULT '+91 9027475942',
  org_email TEXT DEFAULT 'support@staykedarnath.in',
  org_address JSONB DEFAULT '{"streetAddress": "Kedarnath Road", "addressLocality": "Gaurikund", "addressRegion": "Uttarakhand", "postalCode": "246471", "addressCountry": "IN"}'::jsonb,
  
  -- Sitemap Settings
  sitemap_enabled BOOLEAN DEFAULT true,
  sitemap_include_blogs BOOLEAN DEFAULT true,
  sitemap_include_attractions BOOLEAN DEFAULT true,
  sitemap_include_packages BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default row
INSERT INTO seo_settings (id) 
SELECT gen_random_uuid() 
WHERE NOT EXISTS (SELECT 1 FROM seo_settings LIMIT 1);

-- Enable RLS
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

-- Public read policy (everyone can read SEO settings for frontend)
CREATE POLICY "Anyone can read SEO settings" ON seo_settings
  FOR SELECT USING (true);

-- Admin update policy
CREATE POLICY "Admins can update SEO settings" ON seo_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM customer_details
      WHERE customer_details.id = auth.uid()
      AND customer_details.role IN ('admin', 'super_admin')
    )
  );

-- Admin insert policy  
CREATE POLICY "Admins can insert SEO settings" ON seo_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM customer_details
      WHERE customer_details.id = auth.uid()
      AND customer_details.role IN ('admin', 'super_admin')
    )
  );
