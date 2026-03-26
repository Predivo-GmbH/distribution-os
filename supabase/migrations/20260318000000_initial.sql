-- ============================================================
-- Distribution OS — Initial Schema
-- ============================================================

-- Enums
CREATE TYPE product_stage AS ENUM ('pre_launch', 'early', 'active', 'scaling');
CREATE TYPE engine AS ENUM ('pull', 'push', 'bridge', 'search', 'equity', 'persistence');

-- Products
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  stage product_stage NOT NULL DEFAULT 'early',
  primary_engine engine NOT NULL DEFAULT 'pull',
  secondary_engines engine[] DEFAULT '{}',
  revenue numeric DEFAULT NULL,
  color text DEFAULT '#6366f1',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_user_id ON products(user_id);

-- Tasks
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  engine engine NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  score int NOT NULL DEFAULT 1,
  completed boolean NOT NULL DEFAULT false,
  week_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_product_id ON tasks(product_id);
CREATE INDEX idx_tasks_week_id ON tasks(week_id);

-- Week Records (history)
CREATE TABLE week_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_id text NOT NULL,
  total_score int NOT NULL DEFAULT 0,
  max_score int NOT NULL DEFAULT 0,
  completed_at timestamptz DEFAULT NULL,
  UNIQUE(user_id, week_id)
);

CREATE INDEX idx_week_records_user_id ON week_records(user_id);

-- User Preferences
CREATE TABLE user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dark_mode boolean NOT NULL DEFAULT false,
  week_start_day text NOT NULL DEFAULT 'monday',
  subscription_tier text NOT NULL DEFAULT 'free',
  stripe_customer_id text DEFAULT NULL,
  stripe_subscription_id text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE week_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Products: users can only access their own
CREATE POLICY "Users can view own products"
  ON products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own products"
  ON products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own products"
  ON products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own products"
  ON products FOR DELETE USING (auth.uid() = user_id);

-- Tasks: users can only access their own
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE USING (auth.uid() = user_id);

-- Week Records: users can only access their own
CREATE POLICY "Users can view own week records"
  ON week_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own week records"
  ON week_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own week records"
  ON week_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own week records"
  ON week_records FOR DELETE USING (auth.uid() = user_id);

-- User Preferences: users can only access their own
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own preferences"
  ON user_preferences FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Auto-create user preferences on signup
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
