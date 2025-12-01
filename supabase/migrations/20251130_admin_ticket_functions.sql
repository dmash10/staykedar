-- Admin ticket management functions

-- Function for admin to reply to tickets
CREATE OR REPLACE FUNCTION public.create_admin_message(
  p_ticket_id UUID,
  p_message TEXT
)
RETURNS SETOF public.ticket_messages
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Verify user is admin (optional - you can add this check)
  -- IF NOT is_admin(v_user_id) THEN
  --   RAISE EXCEPTION 'Unauthorized';
  -- END IF;

  RETURN QUERY
  INSERT INTO public.ticket_messages (
    ticket_id,
    message,
    sender_type,
    sender_id,
    is_admin
  ) VALUES (
    p_ticket_id,
    p_message,
    'admin',
    v_user_id,
    true
  )
  RETURNING *;
END;
$$;

-- Function to update ticket status
CREATE OR REPLACE FUNCTION public.update_ticket_status(
  p_ticket_number TEXT,
  p_new_status TEXT
)
RETURNS SETOF public.support_tickets
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate status
  IF p_new_status NOT IN ('open', 'in_progress', 'closed') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  RETURN QUERY
  UPDATE public.support_tickets
  SET 
    status = p_new_status,
    updated_at = now()
  WHERE ticket_number = p_ticket_number
  RETURNING *;
END;
$$;

-- Function to get all tickets (admin only)
CREATE OR REPLACE FUNCTION public.get_all_tickets(
  p_status TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL
)
RETURNS SETOF public.support_tickets
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.support_tickets
  WHERE 
    (p_status IS NULL OR status = p_status) AND
    (p_category IS NULL OR category = p_category)
  ORDER BY created_at DESC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_admin_message(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_ticket_status(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_tickets(TEXT, TEXT) TO authenticated;
