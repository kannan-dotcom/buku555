CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN (
    'missing_data','reconciliation','invoice_dispatch','statement_due'
  )),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  related_entity_id UUID,
  related_entity_type TEXT,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reminders_user ON reminders(user_id);
CREATE INDEX idx_reminders_pending ON reminders(is_sent, scheduled_for);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own reminders"
  ON reminders FOR ALL USING (auth.uid() = user_id);
