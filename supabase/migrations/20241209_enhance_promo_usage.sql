-- Add missing columns to promo_code_usage for enterprise analytics

-- 1. Add new columns
ALTER TABLE promo_code_usage 
ADD COLUMN IF NOT EXISTS promo_code TEXT,
ADD COLUMN IF NOT EXISTS booking_type TEXT,
ADD COLUMN IF NOT EXISTS discount_type TEXT,
ADD COLUMN IF NOT EXISTS discount_value DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS order_total DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS order_final DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS user_email TEXT,
ADD COLUMN IF NOT EXISTS user_phone TEXT,
ADD COLUMN IF NOT EXISTS is_first_booking BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS user_total_bookings INTEGER,
ADD COLUMN IF NOT EXISTS device_type TEXT,
ADD COLUMN IF NOT EXISTS browser TEXT,
ADD COLUMN IF NOT EXISTS ip_address INET,
ADD COLUMN IF NOT EXISTS referrer TEXT,
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
ADD COLUMN IF NOT EXISTS check_in_date DATE,
ADD COLUMN IF NOT EXISTS check_out_date DATE,
ADD COLUMN IF NOT EXISTS guests_count INTEGER,
ADD COLUMN IF NOT EXISTS property_id UUID,
ADD COLUMN IF NOT EXISTS property_name TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'applied',
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 2. Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_promo_code_id ON promo_code_usage(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_usage_used_at ON promo_code_usage(used_at);
CREATE INDEX IF NOT EXISTS idx_usage_user_id ON promo_code_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_booking_id ON promo_code_usage(booking_id);
CREATE INDEX IF NOT EXISTS idx_usage_status ON promo_code_usage(status);
CREATE INDEX IF NOT EXISTS idx_usage_device ON promo_code_usage(device_type);
CREATE INDEX IF NOT EXISTS idx_usage_date_range ON promo_code_usage(used_at, promo_code_id);

-- 3. Update Policy
DROP POLICY IF EXISTS "Admin full access" ON promo_code_usage;
CREATE POLICY "Admin full access" ON promo_code_usage FOR ALL USING (true);
