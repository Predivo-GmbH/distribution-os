-- Fleet is off OpenAI (2026-07-31). Drop it from the allowed BYO providers.
-- No prod rows use 'openai' (the feature shipped 2026-07-30 and only test rows existed,
-- which were cleaned up), so tightening the CHECK is safe.

ALTER TABLE user_api_keys
  DROP CONSTRAINT IF EXISTS user_api_keys_provider_check;
ALTER TABLE user_api_keys
  ADD CONSTRAINT user_api_keys_provider_check
  CHECK (provider IN ('anthropic', 'kimi'));
