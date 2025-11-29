-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site_content table
CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(section, key)
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  firebase_uid TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial admin user (will be replaced by actual user when they log in)
INSERT INTO public.admin_users (email, firebase_uid, name, created_at)
VALUES ('ashutoshc1001@gmail.com', 'placeholder-uid', 'Admin User', NOW())
ON CONFLICT (email) DO NOTHING;

-- Create RLS policies for blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to published blog posts" 
  ON public.blog_posts 
  FOR SELECT 
  USING (published = true);

CREATE POLICY "Allow admin users to manage blog posts" 
  ON public.blog_posts 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.firebase_uid = auth.uid()
  ));

-- Create RLS policies for site_content
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to site content" 
  ON public.site_content 
  FOR SELECT 
  TO anon, authenticated;

CREATE POLICY "Allow admin users to manage site content" 
  ON public.site_content 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.firebase_uid = auth.uid()
  ));

-- Create RLS policies for admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin users to view admin users" 
  ON public.admin_users 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.firebase_uid = auth.uid()
  ));

CREATE POLICY "Allow admin users to manage admin users" 
  ON public.admin_users 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.firebase_uid = auth.uid()
  ));

-- Create function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(uid text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE firebase_uid = uid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 