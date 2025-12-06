-- Add destination_slug to seo_itineraries to support multi-destination itineraries
ALTER TABLE seo_itineraries 
ADD COLUMN IF NOT EXISTS destination_slug TEXT DEFAULT 'kedarnath' NOT NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_seo_itineraries_destination ON seo_itineraries(destination_slug);
