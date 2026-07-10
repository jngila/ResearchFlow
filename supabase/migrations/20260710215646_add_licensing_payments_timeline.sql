-- ============================================================
-- RESEARCHFLOW — LICENSING, PAYMENTS, AND TIMELINE SCHEMA
-- ============================================================

ALTER TABLE research_projects
  ADD COLUMN IF NOT EXISTS project_type       text NOT NULL DEFAULT 'masters_thesis'
    CHECK (project_type IN ('undergraduate', 'masters_thesis', 'phd_dissertation')),
  ADD COLUMN IF NOT EXISTS selected_duration_months int,
  ADD COLUMN IF NOT EXISTS project_start_date date,
  ADD COLUMN IF NOT EXISTS project_deadline   date,
  ADD COLUMN IF NOT EXISTS project_status     text NOT NULL DEFAULT 'active'
    CHECK (project_status IN ('active', 'expired', 'completed', 'suspended')),
  ADD COLUMN IF NOT EXISTS extension_count    int NOT NULL DEFAULT 0;

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id     uuid REFERENCES institutions(id) ON DELETE SET NULL,
  user_id            uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id         uuid REFERENCES research_projects(id) ON DELETE SET NULL,
  payment_type       text NOT NULL
    CHECK (payment_type IN (
      'student_project_license', 'student_project_extension',
      'supervisor_license', 'admin_seat'
    )),
  amount_kes         numeric(12,2) NOT NULL,
  payment_method     text NOT NULL
    CHECK (payment_method IN ('mpesa','debit_card','credit_card','bank_transfer')),
  payment_reference  text,
  payment_status     text NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending','completed','failed','refunded')),
  receipt_number     text UNIQUE,
  payment_date       timestamptz,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pay_select_own" ON payments;
CREATE POLICY "pay_select_own" ON payments FOR SELECT
  TO authenticated USING (
    user_id = auth.uid()
    OR institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

DROP POLICY IF EXISTS "pay_insert_own" ON payments;
CREATE POLICY "pay_insert_own" ON payments FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "pay_update_own" ON payments;
CREATE POLICY "pay_update_own" ON payments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'))
  WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE INDEX IF NOT EXISTS idx_payments_user    ON payments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_project ON payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_status  ON payments(payment_status, payment_type);

-- ============================================================
-- STUDENT PROJECT LICENSES
-- ============================================================
CREATE TABLE IF NOT EXISTS student_licenses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id      uuid NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  payment_id      uuid REFERENCES payments(id) ON DELETE SET NULL,
  license_type    text NOT NULL DEFAULT 'project_license'
    CHECK (license_type IN ('project_license','project_extension')),
  purchase_date   timestamptz DEFAULT now(),
  expiry_date     timestamptz NOT NULL,
  payment_status  text NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending','active','expired','refunded')),
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE student_licenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sl_select" ON student_licenses;
CREATE POLICY "sl_select" ON student_licenses FOR SELECT
  TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM research_projects rp
      WHERE rp.id = student_licenses.project_id
        AND rp.institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "sl_insert" ON student_licenses;
CREATE POLICY "sl_insert" ON student_licenses FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "sl_update" ON student_licenses;
CREATE POLICY "sl_update" ON student_licenses FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_sl_user    ON student_licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_sl_project ON student_licenses(project_id);

-- ============================================================
-- SUPERVISOR LICENSES
-- ============================================================
CREATE TABLE IF NOT EXISTS supervisor_licenses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  payment_id      uuid REFERENCES payments(id) ON DELETE SET NULL,
  purchase_date   timestamptz DEFAULT now(),
  expiry_date     timestamptz NOT NULL,
  renewal_date    timestamptz,
  payment_status  text NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending','active','expired','refunded')),
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE supervisor_licenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "svl_select" ON supervisor_licenses;
CREATE POLICY "svl_select" ON supervisor_licenses FOR SELECT
  TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coordinator','institution_admin','super_admin'))
  );

DROP POLICY IF EXISTS "svl_insert" ON supervisor_licenses;
CREATE POLICY "svl_insert" ON supervisor_licenses FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "svl_update" ON supervisor_licenses;
CREATE POLICY "svl_update" ON supervisor_licenses FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_svl_user ON supervisor_licenses(user_id);

-- ============================================================
-- PROJECT MILESTONES (AI planner output)
-- ============================================================
CREATE TABLE IF NOT EXISTS project_milestones (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  title         text NOT NULL,
  description   text,
  phase         text NOT NULL,
  month_number  int NOT NULL,
  week_number   int,
  due_date      date NOT NULL,
  status        text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','in_progress','completed','overdue','skipped')),
  is_ai_generated boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pm_select" ON project_milestones;
CREATE POLICY "pm_select" ON project_milestones FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM research_projects rp
      WHERE rp.id = project_milestones.project_id
        AND rp.institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "pm_insert" ON project_milestones;
CREATE POLICY "pm_insert" ON project_milestones FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM research_projects rp
      WHERE rp.id = project_id
        AND rp.student_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "pm_update" ON project_milestones;
CREATE POLICY "pm_update" ON project_milestones FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM research_projects rp WHERE rp.id = project_milestones.project_id AND rp.student_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM research_projects rp WHERE rp.id = project_id AND rp.student_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_pm_project ON project_milestones(project_id, month_number);

-- ============================================================
-- PLATFORM SETTINGS — KES pricing defaults
-- ============================================================
INSERT INTO platform_settings (key, value, label, description, category) VALUES
  ('student_project_license_kes', '1000',  'Student Project License (KES)', 'One-time fee per student research project.', 'pricing'),
  ('student_extension_license_kes', '1000', 'Project Extension License (KES)', 'One-time 6-month extension. Reactivates an expired project.', 'pricing'),
  ('supervisor_license_kes', '3000', 'Supervisor Professional License (KES)', '3-year professional license with unlimited supervisees and AI tools.', 'pricing'),
  ('supervisor_license_years', '3', 'Supervisor License Duration (years)', 'Number of years the supervisor professional license remains valid.', 'pricing')
ON CONFLICT (key) DO UPDATE
  SET label       = EXCLUDED.label,
      description = EXCLUDED.description,
      category    = EXCLUDED.category;
