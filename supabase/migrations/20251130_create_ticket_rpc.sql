-- Function to create support ticket securely and return details
CREATE OR REPLACE FUNCTION public.create_support_ticket(
  p_guest_name TEXT,
  p_guest_email TEXT,
  p_guest_phone TEXT,
  p_subject TEXT,
  p_category TEXT,
  p_priority TEXT,
  p_message TEXT,
  p_access_pin TEXT
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ticket_id UUID;
  v_ticket_number TEXT;
BEGIN
  -- Insert ticket
  INSERT INTO public.support_tickets (
    guest_name,
    guest_email,
    guest_phone,
    subject,
    category,
    priority,
    status,
    access_pin
  ) VALUES (
    p_guest_name,
    p_guest_email,
    p_guest_phone,
    p_subject,
    p_category,
    p_priority,
    'open',
    p_access_pin
  )
  RETURNING id, ticket_number INTO v_ticket_id, v_ticket_number;

  -- Insert initial message
  INSERT INTO public.ticket_messages (
    ticket_id,
    message,
    sender_type,
    is_admin
  ) VALUES (
    v_ticket_id,
    p_message,
    'guest',
    false
  );

  -- Return result
  RETURN json_build_object(
    'ticket_number', v_ticket_number,
    'access_pin', p_access_pin
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_support_ticket(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO public;
