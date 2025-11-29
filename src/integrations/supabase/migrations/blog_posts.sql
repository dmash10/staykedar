-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts (slug);

-- Create index on published status for filtering
CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON blog_posts (published);

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anyone to read published posts
CREATE POLICY "Allow anyone to read published posts" 
  ON blog_posts 
  FOR SELECT 
  USING (published = TRUE);

-- Allow authenticated users with admin role to do everything
CREATE POLICY "Allow admins to do everything" 
  ON blog_posts 
  FOR ALL 
  USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON blog_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 