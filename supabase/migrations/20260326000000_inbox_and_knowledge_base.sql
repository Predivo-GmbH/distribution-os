-- ============================================================
-- Distribution OS — Inbox Artifacts + Knowledge Bases
-- ============================================================

-- Artifact status enum
CREATE TYPE artifact_status AS ENUM (
  'pending', 'approved', 'scheduled', 'published', 'regenerating', 'dismissed'
);

-- Worker type enum
CREATE TYPE worker_type AS ENUM (
  'seo-content-writer', 'keyword-research', 'search-console-optimizer', 'backlink-outreach',
  'linkedin-director', 'email-sequence-writer', 'lead-magnet-generator', 'waitlist-copy-writer', 'content-performance-analyst',
  'connector-research', 'personalized-outreach', 'demo-script-generator', 'follow-up-sequence', 'connector-performance',
  'keyword-strategy', 'ad-copy-generator', 'landing-page-copy', 'roas-analyst',
  'partner-research', 'pitch-package', 'improvement-prioritizer',
  'weekly-diagnostician', 'messaging-clarity', 'stage-transition-advisor'
);

-- Inbox Artifacts
CREATE TABLE inbox_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  engine engine NOT NULL,
  worker_type worker_type NOT NULL,
  task_title text NOT NULL,
  status artifact_status NOT NULL DEFAULT 'pending',
  content text NOT NULL DEFAULT '',
  edited_content text DEFAULT NULL,
  direction_note text DEFAULT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz DEFAULT NULL,
  scheduled_for timestamptz DEFAULT NULL,
  published_at timestamptz DEFAULT NULL
);

CREATE INDEX idx_inbox_artifacts_user_id ON inbox_artifacts(user_id);
CREATE INDEX idx_inbox_artifacts_product_id ON inbox_artifacts(product_id);
CREATE INDEX idx_inbox_artifacts_status ON inbox_artifacts(status);

-- Knowledge Bases (one per product)
CREATE TABLE knowledge_bases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  voice_examples text[] DEFAULT '{}',
  icp_who text DEFAULT '',
  icp_pain text DEFAULT '',
  icp_tried_before text DEFAULT '',
  icp_desired_outcome text DEFAULT '',
  icp_hangouts_online text DEFAULT '',
  positioning_one_liner text DEFAULT '',
  positioning_benefits text[] DEFAULT '{}'::text[],
  positioning_competitor text DEFAULT '',
  positioning_switch_reason text DEFAULT '',
  tone_formality text NOT NULL DEFAULT 'conversational',
  tone_technicality text NOT NULL DEFAULT 'accessible',
  tone_boldness text NOT NULL DEFAULT 'bold',
  tone_length_preference text NOT NULL DEFAULT 'short-form',
  approved_artifacts jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_knowledge_bases_user_id ON knowledge_bases(user_id);
CREATE INDEX idx_knowledge_bases_product_id ON knowledge_bases(product_id);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE inbox_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_bases ENABLE ROW LEVEL SECURITY;

-- Inbox Artifacts: users can only access their own
CREATE POLICY "Users can view own artifacts"
  ON inbox_artifacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own artifacts"
  ON inbox_artifacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own artifacts"
  ON inbox_artifacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own artifacts"
  ON inbox_artifacts FOR DELETE USING (auth.uid() = user_id);

-- Knowledge Bases: users can only access their own
CREATE POLICY "Users can view own knowledge bases"
  ON knowledge_bases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own knowledge bases"
  ON knowledge_bases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own knowledge bases"
  ON knowledge_bases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own knowledge bases"
  ON knowledge_bases FOR DELETE USING (auth.uid() = user_id);

-- Auto-update updated_at for knowledge_bases
CREATE TRIGGER knowledge_bases_updated_at
  BEFORE UPDATE ON knowledge_bases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
