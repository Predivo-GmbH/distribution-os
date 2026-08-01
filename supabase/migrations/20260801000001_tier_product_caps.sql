-- Pricing-honesty follow-up (2026-08-01, Roger-approved):
-- 1. Enforce the FULL product-cap ladder (free 1 / starter 2 / growth 5 /
--    scale unlimited) — previously only free=1 was enforced, so the paid caps
--    advertised on the pricing page had no server-side teeth.
-- 2. Fix check_ai_generation_limit: it blocked FREE users from inbox_artifacts
--    entirely, contradicting the intended free allowance of 3 AI runs/month
--    (enforced in call-ai against ai_usage). The artifact trigger now mirrors
--    the same monthly ladder (3/15/50/unlimited) instead of a blanket block.

CREATE OR REPLACE FUNCTION check_product_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count int;
  user_tier text;
  cap int;
BEGIN
  SELECT subscription_tier INTO user_tier
    FROM user_preferences WHERE user_id = NEW.user_id;

  cap := CASE COALESCE(user_tier, 'free')
    WHEN 'starter' THEN 2
    WHEN 'growth'  THEN 5
    WHEN 'scale'   THEN NULL -- unlimited
    WHEN 'pro'     THEN NULL -- legacy 2-tier mapping: unlimited
    ELSE 1                   -- free / unknown
  END;

  IF cap IS NOT NULL THEN
    SELECT count(*) INTO current_count
      FROM products WHERE user_id = NEW.user_id;
    IF current_count >= cap THEN
      RAISE EXCEPTION 'The % plan allows only % product(s). Upgrade to continue.',
        COALESCE(user_tier, 'free'), cap;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION check_ai_generation_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_tier text;
  cap int;
  used int;
BEGIN
  SELECT subscription_tier INTO user_tier
    FROM user_preferences WHERE user_id = NEW.user_id;

  cap := CASE COALESCE(user_tier, 'free')
    WHEN 'starter' THEN 15
    WHEN 'growth'  THEN 50
    WHEN 'scale'   THEN NULL -- unlimited
    WHEN 'pro'     THEN NULL -- legacy 2-tier mapping: unlimited
    ELSE 3                   -- free / unknown
  END;

  IF cap IS NOT NULL THEN
    SELECT count(*) INTO used
      FROM inbox_artifacts
      WHERE user_id = NEW.user_id
        AND created_at >= date_trunc('month', now());
    IF used >= cap THEN
      RAISE EXCEPTION 'Monthly AI allowance reached for the % plan. Upgrade to continue.',
        COALESCE(user_tier, 'free');
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
