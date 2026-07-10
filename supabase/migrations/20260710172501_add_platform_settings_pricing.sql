/*
# Platform Settings Table

Stores super-admin-editable key/value configuration for the ResearchFlow platform,
including the pricing model that can be changed without a code deployment.

## New Tables

### platform_settings
Key/value store for platform-wide configuration.
- key (text, primary key) — unique setting identifier, e.g. "price_per_student_usd"
- value (text, not null) — stored as text; the app layer parses to the correct type
- label (text) — human-readable name shown in the admin UI
- description (text) — explains what the setting does
- category (text) — groups settings in the UI (e.g. "pricing", "general")
- updated_by (uuid) — profile id of last editor
- updated_at (timestamptz)

## Initial Seed Data

Inserts the live pricing defaults:
- price_per_student_usd = "10"       → $10 per enrolled student per year
- annual_base_fee_usd   = "100"      → $100 annual base fee per institution (covers staff)
- trial_period_days     = "0"        → no trial; set > 0 to re-enable a trial window

## Security
- RLS enabled
- Only authenticated super_admins (checked via profiles.role) can write
- All authenticated users can read (pricing shown on landing page etc.)
*/

CREATE TABLE IF NOT EXISTS platform_settings (
  key          text PRIMARY KEY,
  value        text NOT NULL,
  label        text NOT NULL,
  description  text NOT NULL DEFAULT '',
  category     text NOT NULL DEFAULT 'general',
  updated_by   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Anyone signed in can read settings (needed for pricing display)
DROP POLICY IF EXISTS "ps_select" ON platform_settings;
CREATE POLICY "ps_select" ON platform_settings FOR SELECT
  TO authenticated USING (true);

-- Anon users can also read (landing page pricing reads these)
DROP POLICY IF EXISTS "ps_select_anon" ON platform_settings;
CREATE POLICY "ps_select_anon" ON platform_settings FOR SELECT
  TO anon USING (true);

-- Only super_admins may insert/update/delete
DROP POLICY IF EXISTS "ps_insert" ON platform_settings;
CREATE POLICY "ps_insert" ON platform_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

DROP POLICY IF EXISTS "ps_update" ON platform_settings;
CREATE POLICY "ps_update" ON platform_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

DROP POLICY IF EXISTS "ps_delete" ON platform_settings;
CREATE POLICY "ps_delete" ON platform_settings FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ============================================================
-- SEED DEFAULT PRICING VALUES
-- ============================================================
INSERT INTO platform_settings (key, value, label, description, category) VALUES
  (
    'price_per_student_usd',
    '10',
    'Per-Student Annual Fee (USD)',
    'Annual fee charged per enrolled student at an institution. Billed per academic year.',
    'pricing'
  ),
  (
    'annual_base_fee_usd',
    '100',
    'Annual Institution Base Fee (USD)',
    'Annual platform access fee per institution. Covers unlimited supervisors, examiners, coordinators, and peer reviewers.',
    'pricing'
  ),
  (
    'trial_period_days',
    '0',
    'Trial Period (days)',
    'Number of days a new institution can use the platform before payment is required. Set to 0 to disable trials.',
    'pricing'
  ),
  (
    'billing_cycle',
    'annual',
    'Billing Cycle',
    'How often institutions are billed. Options: "annual" or "monthly".',
    'pricing'
  ),
  (
    'currency',
    'USD',
    'Billing Currency',
    'Currency used for all invoices and pricing display.',
    'pricing'
  ),
  (
    'min_students',
    '1',
    'Minimum Billable Students',
    'Minimum number of student seats an institution is billed for regardless of actual enrollment.',
    'pricing'
  )
ON CONFLICT (key) DO UPDATE
  SET label       = EXCLUDED.label,
      description = EXCLUDED.description,
      category    = EXCLUDED.category;
