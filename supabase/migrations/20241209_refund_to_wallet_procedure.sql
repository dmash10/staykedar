-- Function to process refund to wallet atomically
CREATE OR REPLACE FUNCTION process_wallet_refund(
  p_booking_id UUID,
  p_refund_amount DECIMAL,
  p_admin_notes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_wallet_id UUID;
  v_current_balance DECIMAL;
  v_booking_status TEXT;
BEGIN
  -- 1. Get Booking Details & Verify
  SELECT user_id, status INTO v_user_id, v_booking_status
  FROM package_bookings
  WHERE id = p_booking_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF v_booking_status = 'refund_completed' THEN
     RAISE EXCEPTION 'Booking is already refunded';
  END IF;

  -- 2. Ensure Wallet Exists (Upsert)
  INSERT INTO user_wallets (user_id, balance)
  VALUES (v_user_id, 0)
  ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
  RETURNING id, balance INTO v_wallet_id, v_current_balance;

  -- 3. Update Wallet Balance
  UPDATE user_wallets
  SET balance = balance + p_refund_amount,
      updated_at = NOW()
  WHERE id = v_wallet_id;

  -- 4. Create Transaction Record
  INSERT INTO wallet_transactions (
    wallet_id,
    type,
    source,
    amount,
    description,
    created_at
  ) VALUES (
    v_wallet_id,
    'credit',
    'refund',
    p_refund_amount,
    COALESCE(p_admin_notes, 'Refund processed by admin'),
    NOW()
  );

  -- 5. Update Booking Status
  UPDATE package_bookings
  SET status = 'refund_completed',
      updated_at = NOW()
  WHERE id = p_booking_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_current_balance + p_refund_amount,
    'wallet_id', v_wallet_id
  );
END;
$$;
