-- Create admin_activity_logs table
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Admins can view all logs
CREATE POLICY "Admins can view all activity logs" 
ON public.admin_activity_logs FOR SELECT 
TO authenticated 
USING (true);

-- Admins can insert logs
CREATE POLICY "Admins can insert activity logs" 
ON public.admin_activity_logs FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = admin_id);

-- Add simple index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON public.admin_activity_logs(created_at DESC);
