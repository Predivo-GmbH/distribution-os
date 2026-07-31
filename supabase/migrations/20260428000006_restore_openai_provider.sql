-- Restore OpenAI as an allowed BYO provider (reverts migration 005). Distribution-OS BYO
-- is bring-your-own-key: the user supplies + pays for their own OpenAI key, so offering it
-- costs the fleet nothing. Removing it was a mistake — put it back.

ALTER TABLE user_api_keys
  DROP CONSTRAINT IF EXISTS user_api_keys_provider_check;
ALTER TABLE user_api_keys
  ADD CONSTRAINT user_api_keys_provider_check
  CHECK (provider IN ('anthropic', 'kimi', 'openai'));
