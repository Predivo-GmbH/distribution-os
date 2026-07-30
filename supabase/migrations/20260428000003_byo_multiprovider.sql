-- Task C: BYO multi-provider (Anthropic / Kimi / OpenAI) for call-ai.
-- user_api_keys stored a single (assumed-Anthropic) key. A user can now bring an
-- OpenAI or Kimi key too, and OpenAI speaks a different API shape (Chat Completions),
-- so the provider must be stored explicitly — a key prefix alone can't disambiguate
-- OpenAI (`sk-…`) from Kimi (`sk-…`).

ALTER TABLE user_api_keys
  ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'anthropic';

ALTER TABLE user_api_keys
  DROP CONSTRAINT IF EXISTS user_api_keys_provider_check;
ALTER TABLE user_api_keys
  ADD CONSTRAINT user_api_keys_provider_check
  CHECK (provider IN ('anthropic', 'kimi', 'openai'));

-- Per-provider usage metering: record which provider actually served each call so a
-- BYO user (and per-provider reporting) can see it. Nullable — old rows predate it.
ALTER TABLE ai_usage
  ADD COLUMN IF NOT EXISTS provider TEXT;
