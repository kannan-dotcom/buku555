-- =============================================
-- Add company_id to all data tables + new RLS
-- =============================================

-- Helper: get current user's company_id from profiles (fast PK lookup)
-- Used in RLS policies for performance
CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: get current user's company role
CREATE OR REPLACE FUNCTION public.get_my_company_role()
RETURNS TEXT AS $$
  SELECT cm.role FROM company_members cm
  JOIN profiles p ON p.company_id = cm.company_id
  WHERE cm.user_id = auth.uid() AND p.id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- =============================================
-- 1. documents
-- =============================================
ALTER TABLE documents ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_documents_company ON documents(company_id);

DROP POLICY IF EXISTS "Users can manage own documents" ON documents;

CREATE POLICY "Company members can view documents"
  ON documents FOR SELECT
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Company members can insert documents"
  ON documents FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "Authorized members can update documents"
  ON documents FOR UPDATE
  USING (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin', 'accountant'));

CREATE POLICY "Owner/admin can delete documents"
  ON documents FOR DELETE
  USING (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin'));

-- =============================================
-- 2. ledger_entries
-- =============================================
ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_ledger_company ON ledger_entries(company_id);

DROP POLICY IF EXISTS "Users can manage own ledger entries" ON ledger_entries;

CREATE POLICY "Company members can view ledger"
  ON ledger_entries FOR SELECT
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Authorized members can insert ledger"
  ON ledger_entries FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin', 'accountant'));

CREATE POLICY "Authorized members can update ledger"
  ON ledger_entries FOR UPDATE
  USING (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin', 'accountant'));

CREATE POLICY "Owner/admin can delete ledger"
  ON ledger_entries FOR DELETE
  USING (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin'));

-- =============================================
-- 3. bank_transactions
-- =============================================
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_bank_txns_company ON bank_transactions(company_id);

DROP POLICY IF EXISTS "Users can manage own bank transactions" ON bank_transactions;

CREATE POLICY "Company members can view bank transactions"
  ON bank_transactions FOR SELECT
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Authorized members can insert bank transactions"
  ON bank_transactions FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin', 'accountant'));

CREATE POLICY "Authorized members can update bank transactions"
  ON bank_transactions FOR UPDATE
  USING (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin', 'accountant'));

CREATE POLICY "Owner/admin can delete bank transactions"
  ON bank_transactions FOR DELETE
  USING (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin'));

-- =============================================
-- 4. clients
-- =============================================
ALTER TABLE clients ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company_id);

DROP POLICY IF EXISTS "Users can manage own clients" ON clients;

CREATE POLICY "Company members can view clients"
  ON clients FOR SELECT
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Authorized members can insert clients"
  ON clients FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin', 'accountant'));

CREATE POLICY "Authorized members can update clients"
  ON clients FOR UPDATE
  USING (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin', 'accountant'));

CREATE POLICY "Owner/admin can delete clients"
  ON clients FOR DELETE
  USING (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin'));

-- =============================================
-- 5. invoices_sent
-- =============================================
ALTER TABLE invoices_sent ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices_sent(company_id);

DROP POLICY IF EXISTS "Users can manage own invoices" ON invoices_sent;

CREATE POLICY "Company members can view invoices"
  ON invoices_sent FOR SELECT
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Authorized members can insert invoices"
  ON invoices_sent FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin', 'accountant'));

CREATE POLICY "Authorized members can update invoices"
  ON invoices_sent FOR UPDATE
  USING (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin', 'accountant'));

CREATE POLICY "Owner/admin can delete invoices"
  ON invoices_sent FOR DELETE
  USING (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin'));

-- =============================================
-- 6. company_documents
-- =============================================
ALTER TABLE company_documents ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_company_docs_company ON company_documents(company_id);

DROP POLICY IF EXISTS "Users can manage own company documents" ON company_documents;

CREATE POLICY "Company members can view company docs"
  ON company_documents FOR SELECT
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Authorized members can insert company docs"
  ON company_documents FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin', 'accountant'));

CREATE POLICY "Authorized members can update company docs"
  ON company_documents FOR UPDATE
  USING (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin', 'accountant'));

CREATE POLICY "Owner/admin can delete company docs"
  ON company_documents FOR DELETE
  USING (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin'));

-- =============================================
-- 7. financial_statements
-- =============================================
ALTER TABLE financial_statements ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_fin_statements_company ON financial_statements(company_id);

DROP POLICY IF EXISTS "Users can manage own financial statements" ON financial_statements;

CREATE POLICY "Company members can view financial statements"
  ON financial_statements FOR SELECT
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Authorized members can insert financial statements"
  ON financial_statements FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin', 'accountant'));

CREATE POLICY "Authorized members can update financial statements"
  ON financial_statements FOR UPDATE
  USING (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin', 'accountant'));

CREATE POLICY "Owner/admin can delete financial statements"
  ON financial_statements FOR DELETE
  USING (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin'));

-- =============================================
-- 8. reminders
-- =============================================
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_reminders_company ON reminders(company_id);

DROP POLICY IF EXISTS "Users can manage own reminders" ON reminders;

CREATE POLICY "Company members can view reminders"
  ON reminders FOR SELECT
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Authorized members can insert reminders"
  ON reminders FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin', 'accountant'));

CREATE POLICY "Authorized members can update reminders"
  ON reminders FOR UPDATE
  USING (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin', 'accountant'));

CREATE POLICY "Owner/admin can delete reminders"
  ON reminders FOR DELETE
  USING (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin'));

-- =============================================
-- 9. reference_guides
-- =============================================
ALTER TABLE reference_guides ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_ref_guides_company ON reference_guides(company_id);

DROP POLICY IF EXISTS "Users can manage own reference guides" ON reference_guides;

CREATE POLICY "Company members can view reference guides"
  ON reference_guides FOR SELECT
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Company members can insert reference guides"
  ON reference_guides FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "Authorized members can update reference guides"
  ON reference_guides FOR UPDATE
  USING (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin', 'accountant'));

CREATE POLICY "Owner/admin can delete reference guides"
  ON reference_guides FOR DELETE
  USING (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin'));

-- =============================================
-- 10. gdrive_folders
-- =============================================
ALTER TABLE gdrive_folders ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_gdrive_folders_company ON gdrive_folders(company_id);

DROP POLICY IF EXISTS "Users can manage own folders" ON gdrive_folders;

CREATE POLICY "Company members can view gdrive folders"
  ON gdrive_folders FOR SELECT
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Company members can insert gdrive folders"
  ON gdrive_folders FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "Company members can update gdrive folders"
  ON gdrive_folders FOR UPDATE
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Owner/admin can delete gdrive folders"
  ON gdrive_folders FOR DELETE
  USING (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin'));
