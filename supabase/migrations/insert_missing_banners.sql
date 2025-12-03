-- Insert missing banner categories

-- Footer Banner
INSERT INTO banners (title, subtitle, position, link_url, link_text, is_active, display_order, target_devices, target_pages, background_color, text_color, image_url) VALUES
('Download Our App', 'Get exclusive mobile-only deals and manage your bookings on the go', 'footer', '/app', 'Download Now', true, 1, ARRAY['desktop', 'mobile', 'tablet'], ARRAY['*'], '#1a73e8', '#ffffff', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=400&fit=crop');

-- Destination Banner
INSERT INTO banners (title, subtitle, position, link_url, link_text, is_active, display_order, target_devices, target_pages, background_color, text_color, image_url) VALUES
('Explore Guptkashi', 'The hidden Kashi of the Himalayas - A perfect stopover', 'destination', '/destinations/guptkashi', 'Explore', true, 1, ARRAY['desktop', 'mobile', 'tablet'], ARRAY['/destinations*'], '#ea4335', '#ffffff', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&h=400&fit=crop');

-- Search Banner
INSERT INTO banners (title, subtitle, position, link_url, link_text, is_active, display_order, target_devices, target_pages, background_color, text_color, image_url) VALUES
('Cant find what you need?', 'Contact our travel experts for a customized itinerary', 'search', '/contact', 'Contact Us', true, 1, ARRAY['desktop', 'mobile', 'tablet'], ARRAY['/search*'], '#fbbc04', '#000000', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&h=400&fit=crop');

-- Confirmation Banner
INSERT INTO banners (title, subtitle, position, link_url, link_text, is_active, display_order, target_devices, target_pages, background_color, text_color, image_url) VALUES
('Complete Your Journey', 'Add a helicopter ride to your package for a seamless experience', 'confirmation', '/helicopter', 'Add Helicopter', true, 1, ARRAY['desktop', 'mobile', 'tablet'], ARRAY['/booking/confirmation*'], '#34a853', '#ffffff', 'https://images.unsplash.com/photo-1506057527569-6402919d3f04?w=1200&h=400&fit=crop');

-- Inline Banner (Generic)
INSERT INTO banners (title, subtitle, position, link_url, link_text, is_active, display_order, target_devices, target_pages, background_color, text_color, image_url) VALUES
('Special Offer', 'Get 10% off on group bookings', 'inline', '/offers', 'View Offer', true, 1, ARRAY['desktop', 'mobile', 'tablet'], ARRAY['*'], '#0071c2', '#ffffff', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&h=400&fit=crop');
