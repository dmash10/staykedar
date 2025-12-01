-- Enhanced ticket fetch with user profile data
CREATE OR REPLACE FUNCTION public.get_tickets_with_profiles(
  p_status TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  ticket_number TEXT,
  subject TEXT,
  category TEXT,
  priority TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_id UUID,
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  user_full_name TEXT,
  user_email TEXT,
  user_phone TEXT,
  user_avatar_url TEXT,
  user_created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.id,
    st.ticket_number,
    st.subject,
    st.category,
    st.priority,
    st.status,
    st.created_at,
    st.updated_at,
    st.user_id,
    st.guest_name,
    st.guest_email,
    st.guest_phone,
    p.full_name as user_full_name,
    p.email as user_email,
    p.phone_number as user_phone,
    p.avatar_url as user_avatar_url,
    p.created_at as user_created_at
  FROM public.support_tickets st
  LEFT JOIN public.profiles p ON st.user_id = p.id
  WHERE 
    (p_status IS NULL OR st.status = p_status)
    AND (p_category IS NULL OR st.category = p_category)
  ORDER BY st.created_at DESC;
END;
$$;

-- Create internal notes table
CREATE TABLE IF NOT EXISTS public.ticket_internal_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create canned responses table
CREATE TABLE IF NOT EXISTS public.canned_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  shortcut TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Function to add internal note
CREATE OR REPLACE FUNCTION public.add_internal_note(
  p_ticket_id UUID,
  p_note TEXT
)
RETURNS SETOF public.ticket_internal_notes
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  v_admin_id := auth.uid();
  
  RETURN QUERY
  INSERT INTO public.ticket_internal_notes (ticket_id, admin_id, note)
  VALUES (p_ticket_id, v_admin_id, p_note)
  RETURNING *;
END;
$$;

-- Function to get internal notes for a ticket
CREATE OR REPLACE FUNCTION public.get_internal_notes(
  p_ticket_id UUID
)
RETURNS TABLE (
  id UUID,
  note TEXT,
  admin_name TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.note,
    p.full_name as admin_name,
    n.created_at
  FROM public.ticket_internal_notes n
  LEFT JOIN public.profiles p ON n.admin_id = p.id
  WHERE n.ticket_id = p_ticket_id
  ORDER BY n.created_at DESC;
END;
$$;

-- Function to get canned responses
CREATE OR REPLACE FUNCTION public.get_canned_responses(
  p_category TEXT DEFAULT NULL
)
RETURNS SETOF public.canned_responses
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.canned_responses
  WHERE p_category IS NULL OR category = p_category
  ORDER BY title;
END;
$$;

-- Insert some default canned responses
INSERT INTO public.canned_responses (title, content, category, shortcut) VALUES
('Investigating', 'Thank you for reaching out. I''m looking into this issue and will get back to you shortly.', 'general', '/inv'),
('Need More Info', 'To help resolve this issue, could you please provide more details about [specific information needed]?', 'general', '/info'),
('Escalated', 'I''ve escalated this to our technical team. They will investigate and provide an update within 24 hours.', 'technical', '/esc'),
('Resolved', 'This issue has been resolved. Please let us know if you need any further assistance.', 'general', '/res'),
('Follow Up', 'I wanted to follow up on your ticket. Is everything working as expected now?', 'general', '/follow'),
('Account Issue', 'I can help you with your account. Let me verify your details and assist you further.', 'account', '/acc')
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_tickets_with_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_internal_note TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_internal_notes TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_canned_responses TO authenticated;
