-- Task C follow-up: BYO keys are now encrypted at rest and written ONLY through the
-- save-api-key edge function (service role). Remove the user's direct write access so a
-- plaintext key can't be upserted straight into the table, bypassing encryption.
-- SELECT-own stays (harmless; lets a future UI show "key configured").

DROP POLICY IF EXISTS "Users manage own API key" ON user_api_keys;

DROP POLICY IF EXISTS "Users read own API key" ON user_api_keys;
CREATE POLICY "Users read own API key"
  ON user_api_keys FOR SELECT
  USING (auth.uid() = user_id);
