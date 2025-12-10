-- Fix insecure RLS policy on admin_activity_logs
-- Current policy allows all authenticated users (including customers) to view logs
-- We need to restrict this to only admin users

BEGIN;

-- Drop the insecure policy
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.admin_activity_logs;

-- Re-create stricter policy
CREATE POLICY "Admins can view all activity logs" 
ON public.admin_activity_logs FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid()
  )
);

COMMIT;
