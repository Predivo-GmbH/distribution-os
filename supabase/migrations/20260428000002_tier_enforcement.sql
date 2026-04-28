-- Sprint 0: Server-side subscription tier enforcement
-- Defense-in-depth: even if frontend gates are bypassed, server blocks unauthorized actions

-- Enforce product limit based on subscription tier
CREATE OR REPLACE FUNCTION check_product_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count int;
  user_tier text;
BEGIN
  SELECT subscription_tier INTO user_tier
    FROM user_preferences WHERE user_id = NEW.user_id;

  -- Free tier: max 1 product
  IF user_tier IS NULL OR user_tier = 'free' THEN
    SELECT count(*) INTO current_count
      FROM products WHERE user_id = NEW.user_id;
    IF current_count >= 1 THEN
      RAISE EXCEPTION 'Free plan allows only 1 product. Upgrade to continue.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_product_limit
  BEFORE INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION check_product_limit();

-- Enforce AI generation limit (free users cannot generate)
CREATE OR REPLACE FUNCTION check_ai_generation_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_tier text;
BEGIN
  SELECT subscription_tier INTO user_tier
    FROM user_preferences WHERE user_id = NEW.user_id;

  IF user_tier IS NULL OR user_tier = 'free' THEN
    RAISE EXCEPTION 'AI generation requires a paid subscription.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_ai_generation_limit
  BEFORE INSERT ON inbox_artifacts
  FOR EACH ROW EXECUTE FUNCTION check_ai_generation_limit();
