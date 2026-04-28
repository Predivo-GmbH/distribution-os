-- Sprint 0: Fix handle_new_user() to be idempotent (ON CONFLICT DO NOTHING)
-- Prevents signup failures when trigger fires on OTP retry

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
