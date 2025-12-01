-- Add columns to support_tickets
ALTER TABLE public.support_tickets 
ADD COLUMN IF NOT EXISTS ticket_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS access_pin TEXT,
ADD COLUMN IF NOT EXISTS guest_email TEXT,
ADD COLUMN IF NOT EXISTS guest_name TEXT,
ADD COLUMN IF NOT EXISTS guest_phone TEXT;

-- Add columns to ticket_messages
ALTER TABLE public.ticket_messages
ADD COLUMN IF NOT EXISTS sender_type TEXT DEFAULT 'user';

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  new_ticket_number TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character string (uppercase + numbers)
    new_ticket_number := 'TKT-' || upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if it exists
    SELECT EXISTS (SELECT 1 FROM public.support_tickets WHERE ticket_number = new_ticket_number) INTO exists;
    
    IF NOT exists THEN
      NEW.ticket_number := new_ticket_number;
      EXIT;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for ticket number
DROP TRIGGER IF EXISTS set_ticket_number ON public.support_tickets;
CREATE TRIGGER set_ticket_number
BEFORE INSERT ON public.support_tickets
FOR EACH ROW
WHEN (NEW.ticket_number IS NULL)
EXECUTE FUNCTION generate_ticket_number();

-- Secure function to get ticket by PIN
CREATE OR REPLACE FUNCTION public.get_ticket_by_pin(p_ticket_number TEXT, p_pin TEXT)
RETURNS SETOF public.support_tickets
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.support_tickets
  WHERE ticket_number = p_ticket_number AND access_pin = p_pin;
END;
$$;

-- Secure function to get messages by PIN
CREATE OR REPLACE FUNCTION public.get_ticket_messages_by_pin(p_ticket_number TEXT, p_pin TEXT)
RETURNS SETOF public.ticket_messages
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ticket_id UUID;
BEGIN
  -- Verify ticket and get ID
  SELECT id INTO v_ticket_id
  FROM public.support_tickets
  WHERE ticket_number = p_ticket_number AND access_pin = p_pin;

  IF v_ticket_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT * FROM public.ticket_messages
  WHERE ticket_id = v_ticket_id
  ORDER BY created_at ASC;
END;
$$;

-- Secure function to create guest message
CREATE OR REPLACE FUNCTION public.create_guest_message(p_ticket_number TEXT, p_pin TEXT, p_message TEXT)
RETURNS public.ticket_messages
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ticket_id UUID;
  v_new_message public.ticket_messages;
BEGIN
  -- Verify ticket and get ID
  SELECT id INTO v_ticket_id
  FROM public.support_tickets
  WHERE ticket_number = p_ticket_number AND access_pin = p_pin;

  IF v_ticket_id IS NULL THEN
    RAISE EXCEPTION 'Invalid ticket number or PIN';
  END IF;

  INSERT INTO public.ticket_messages (ticket_id, message, sender_type, is_admin)
  VALUES (v_ticket_id, p_message, 'guest', false)
  RETURNING * INTO v_new_message;

  RETURN v_new_message;
END;
$$;

-- RLS Policies
-- Allow public insert to support_tickets (for guest creation)
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to support_tickets"
ON public.support_tickets
FOR INSERT
TO public
WITH CHECK (true);

-- Ensure authenticated users can see their own tickets
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets"
ON public.support_tickets
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;
CREATE POLICY "Users can create tickets"
ON public.support_tickets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Grant execute on functions to public
GRANT EXECUTE ON FUNCTION public.get_ticket_by_pin(TEXT, TEXT) TO public;
GRANT EXECUTE ON FUNCTION public.get_ticket_messages_by_pin(TEXT, TEXT) TO public;
GRANT EXECUTE ON FUNCTION public.create_guest_message(TEXT, TEXT, TEXT) TO public;
