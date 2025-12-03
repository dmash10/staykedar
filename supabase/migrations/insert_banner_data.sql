-- Professional Banner Data Setup
-- Run this in Supabase SQL Editor after running the main migration

-- Clear existing banners (optional - only for fresh setup)
DELETE FROM banners;

-- Insert professional banners
INSERT INTO banners (title, subtitle, position, link_url, link_text, is_active, display_order, target_devices, target_pages, background_color, text_color) VALUES
('Winter Special - Kedarnath Yatra 2025', 'Book now and save up to 30% on all pilgrimage packages', 'homepage', '/packages', 'View Packages', true, 1, ARRAY['desktop', 'mobile', 'tablet'], ARRAY['*'], '#0071c2', '#ffffff'),
('Early Bird Discount - Plan Ahead', 'Reserve your spot early and get exclusive deals on Char Dham Yatra', 'hero', '/packages', 'Explore Packages', true, 1, ARRAY['desktop', 'mobile', 'tablet'], ARRAY['/', '/packages'], '#003580', '#ffffff'),
('Complete Char Dham Package Available', 'Experience the divine journey with our premium all-inclusive packages', 'package', '/packages', 'Learn More', true, 1, ARRAY['desktop', 'mobile', 'tablet'], ARRAY['/packages*'], '#1a73e8', '#ffffff'),
('Travel Tips & Essential Guides', 'Read our comprehensive blog for complete travel preparation tips', 'blog', '/blog', 'Read Articles', true, 1, ARRAY['desktop', 'mobile', 'tablet'], ARRAY['/blog*'], '#34a853', '#ffffff'),
('Limited Time Group Booking Offer!', 'Special rates available for group bookings - Contact us today', 'sidebar', '/contact', 'Get Quote', true, 1, ARRAY['desktop', 'tablet'], ARRAY['*'], '#ea4335', '#ffffff'),
('Welcome to StayKedar!', 'Get 15% off on your first booking with us', 'popup', '/packages', 'Claim Offer', true, 1, ARRAY['desktop', 'mobile', 'tablet'], ARRAY['/'], '#fbbc04', '#000000');

-- Verify inserted banners
SELECT 
    position,
    title,
    is_active,
    link_text,
    background_color
FROM banners
ORDER BY position;
