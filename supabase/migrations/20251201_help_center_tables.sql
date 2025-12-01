-- Create help_categories table
CREATE TABLE IF NOT EXISTS help_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Lucide icon name
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create help_articles table
CREATE TABLE IF NOT EXISTS help_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES help_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL, -- Markdown or HTML
  is_published BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE help_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_articles ENABLE ROW LEVEL SECURITY;

-- Policies for help_categories
CREATE POLICY "Public can view help categories" 
  ON help_categories FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage help categories" 
  ON help_categories FOR ALL 
  USING (auth.uid() IN (SELECT id FROM customer_details WHERE role = 'admin'));

-- Policies for help_articles
CREATE POLICY "Public can view published help articles" 
  ON help_articles FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Admins can manage help articles" 
  ON help_articles FOR ALL 
  USING (auth.uid() IN (SELECT id FROM customer_details WHERE role = 'admin'));

-- Insert Seed Data for Categories
INSERT INTO help_categories (name, slug, description, icon, sort_order) VALUES
('Getting Started', 'getting-started', 'New to StayKedar? Start here.', 'Rocket', 1),
('Account & Profile', 'account-profile', 'Manage your account settings and profile.', 'User', 2),
('Bookings & Payments', 'bookings-payments', 'Everything about booking a stay and payments.', 'CreditCard', 3),
('Cancellations & Refunds', 'cancellations-refunds', 'Understand our cancellation policies.', 'XCircle', 4),
('Safety & Security', 'safety-security', 'Your safety is our top priority.', 'Shield', 5),
('Hosting', 'hosting', 'For property owners and hosts.', 'Home', 6);

-- Insert Seed Data for Articles (using placeholders for IDs, we'll need to fetch them dynamically in a real app, but for SQL seed we can use subqueries)

-- Getting Started Articles
INSERT INTO help_articles (category_id, title, slug, content, is_published) 
SELECT id, 'How to create an account', 'how-to-create-account', 'To create an account, click on the "Sign Up" button in the top right corner. You can sign up using your email address or Google account.', true
FROM help_categories WHERE slug = 'getting-started';

INSERT INTO help_articles (category_id, title, slug, content, is_published) 
SELECT id, 'How to book your first stay', 'how-to-book-first-stay', 'Booking a stay is easy! Browse our listings, select your dates, and click "Book Now". Follow the prompts to complete your payment.', true
FROM help_categories WHERE slug = 'getting-started';

-- Bookings Articles
INSERT INTO help_articles (category_id, title, slug, content, is_published) 
SELECT id, 'Payment methods accepted', 'payment-methods', 'We accept all major credit cards (Visa, MasterCard, Amex), PayPal, and UPI.', true
FROM help_categories WHERE slug = 'bookings-payments';

INSERT INTO help_articles (category_id, title, slug, content, is_published) 
SELECT id, 'How to modify a booking', 'modify-booking', 'To modify a booking, go to "My Bookings", select the booking you want to change, and click "Modify". Note that changes are subject to availability and policy.', true
FROM help_categories WHERE slug = 'bookings-payments';

-- Cancellations Articles
INSERT INTO help_articles (category_id, title, slug, content, is_published) 
SELECT id, 'Cancellation Policy Explained', 'cancellation-policy', 'Our cancellation policy varies by property. Generally, you can cancel up to 48 hours before check-in for a full refund. Check the specific property listing for details.', true
FROM help_categories WHERE slug = 'cancellations-refunds';
