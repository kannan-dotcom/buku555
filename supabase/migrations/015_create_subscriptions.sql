-- =============================================
-- Subscription plans and user subscriptions
-- =============================================

CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,              -- 'free', 'team', 'business'
  max_users INTEGER NOT NULL,
  price_monthly NUMERIC(10,2) NOT NULL,
  price_annual NUMERIC(10,2) NOT NULL,    -- with 10% discount
  features JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default plans
INSERT INTO subscription_plans (name, slug, max_users, price_monthly, price_annual, features) VALUES
  ('Starter', 'free', 2, 0, 0, '{"receipts": true, "bank_statements": true, "reconciliation": true, "invoices": true, "financial_statements": true, "gdrive_sync": true, "ai_processing": true, "support": "community"}'),
  ('Team', 'team', 5, 39, 421.20, '{"receipts": true, "bank_statements": true, "reconciliation": true, "invoices": true, "financial_statements": true, "gdrive_sync": true, "ai_processing": true, "priority_support": true, "multi_user": true, "support": "email"}'),
  ('Business', 'business', 999, 99, 1069.20, '{"receipts": true, "bank_statements": true, "reconciliation": true, "invoices": true, "financial_statements": true, "gdrive_sync": true, "ai_processing": true, "priority_support": true, "multi_user": true, "dedicated_account_manager": true, "custom_reports": true, "api_access": true, "support": "priority"}');

CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  billing_cycle TEXT DEFAULT 'monthly'
    CHECK (billing_cycle IN ('monthly','annual')),
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active','cancelled','expired','trial')),
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_subs_user ON user_subscriptions(user_id);
CREATE INDEX idx_user_subs_status ON user_subscriptions(status);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Plans are readable by everyone
CREATE POLICY "Plans are publicly readable"
  ON subscription_plans FOR SELECT
  USING (true);

-- Users can see their own subscription
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can manage subscriptions
CREATE POLICY "Admins can manage subscriptions"
  ON user_subscriptions FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));
