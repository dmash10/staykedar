-- Simplify ticket system: remove PIN requirement, make user_id optional, remove priority

-- Drop old functions
DROP FUNCTION IF EXISTS public.get_ticket_by_pin(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.get_ticket_messages_by_pin(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_support_ticket(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_guest_message(TEXT, TEXT, TEXT);

-- Create new function to get ticket by number only
CREATE OR REPLACE FUNCTION public.get_ticket_by_number(p_ticket_number TEXT)
RETURNS SETOF public.support_tickets
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.support_tickets
  WHERE ticket_number = p_ticket_number;
END;
$$;

-- Create new function to get ticket messages by number only
CREATE OR REPLACE FUNCTION public.get_ticket_messages_by_number(p_ticket_number TEXT)
RETURNS SETOF public.ticket_messages
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ticket_id UUID;
BEGIN
  -- Get ticket ID from ticket number
  SELECT id INTO v_ticket_id
  FROM public.support_tickets
  WHERE ticket_number = p_ticket_number;

  IF v_ticket_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT * FROM public.ticket_messages
  WHERE ticket_id = v_ticket_id
  ORDER BY created_at ASC;
END;
$$;

-- Create simplified ticket creation function
CREATE OR REPLACE FUNCTION public.create_support_ticket(
  p_subject TEXT,
  p_category TEXT,
  p_message TEXT
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ticket_id UUID;
  v_ticket_number TEXT;
  v_user_id UUID;
BEGIN
  -- Get current user ID (null if not authenticated)
  v_user_id := auth.uid();

  -- Insert ticket
  INSERT INTO public.support_tickets (
    user_id,
    subject,
    category,
    priority,
    status
  ) VALUES (
    v_user_id,
    p_subject,
    p_category,
    'medium',
    'open'
  )
  RETURNING id, ticket_number INTO v_ticket_id, v_ticket_number;

  -- Insert initial message
  INSERT INTO public.ticket_messages (
    ticket_id,
    message,
    sender_type,
    sender_id,
    is_admin
  ) VALUES (
    v_ticket_id,
    p_message,
    CASE WHEN v_user_id IS NULL THEN 'guest' ELSE 'user' END,
    v_user_id,
    false
  );

  -- Return result
  RETURN json_build_object(
    'ticket_number', v_ticket_number
  );
END;
$$;

-- Create function to add message to ticket
CREATE OR REPLACE FUNCTION public.create_ticket_message(
  p_ticket_number TEXT,
  p_message TEXT
)
RETURNS SETOF public.ticket_messages
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ticket_id UUID;
  v_user_id UUID;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();

  -- Get ticket ID from ticket number
  SELECT id INTO v_ticket_id
  FROM public.support_tickets
  WHERE ticket_number = p_ticket_number;

  IF v_ticket_id IS NULL THEN
    RAISE EXCEPTION 'Ticket not found';
  END IF;

  RETURN QUERY
  INSERT INTO public.ticket_messages (
    ticket_id,
    message,
    sender_type,
    sender_id,
    is_admin
  ) VALUES (
    v_ticket_id,
    p_message,
    CASE WHEN v_user_id IS NULL THEN 'guest' ELSE 'user' END,
    v_user_id,
    false
  )
  RETURNING *;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_ticket_by_number(TEXT) TO public;
GRANT EXECUTE ON FUNCTION public.get_ticket_messages_by_number(TEXT) TO public;
GRANT EXECUTE ON FUNCTION public.create_support_ticket(TEXT, TEXT, TEXT) TO public;
GRANT EXECUTE ON FUNCTION public.create_ticket_message(TEXT, TEXT) TO public;
