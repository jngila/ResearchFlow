-- ============================================================
-- ADMIN SEATS: purchased count on institutions
-- ============================================================
ALTER TABLE institutions
  ADD COLUMN IF NOT EXISTS admin_seats_purchased int NOT NULL DEFAULT 0;

-- ============================================================
-- ADMIN SEAT REQUESTS
-- Universities request N admin accounts. Super-admin approves
-- after confirming payment ($100 per seat). On approval the
-- seats_requested count is added to admin_seats_purchased.
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_seat_requests (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id     uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  seats_requested    int  NOT NULL CHECK (seats_requested >= 1),
  seats_approved     int  CHECK (seats_approved >= 0),
  status             text NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'approved', 'rejected')),
  requester_notes    text,
  reviewer_notes     text,
  requested_by       uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_by        uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at        timestamptz,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

ALTER TABLE admin_seat_requests ENABLE ROW LEVEL SECURITY;

-- Institution admins and super-admins can read requests for their institution
DROP POLICY IF EXISTS "asr_select" ON admin_seat_requests;
CREATE POLICY "asr_select" ON admin_seat_requests FOR SELECT
  TO authenticated USING (
    institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Institution admins can create requests for their own institution
DROP POLICY IF EXISTS "asr_insert" ON admin_seat_requests;
CREATE POLICY "asr_insert" ON admin_seat_requests FOR INSERT
  TO authenticated WITH CHECK (
    institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('institution_admin', 'super_admin')
    )
  );

-- Only super-admins can update (approve / reject)
DROP POLICY IF EXISTS "asr_update" ON admin_seat_requests;
CREATE POLICY "asr_update" ON admin_seat_requests FOR UPDATE
  TO authenticated
  USING  (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE INDEX IF NOT EXISTS idx_asr_institution ON admin_seat_requests(institution_id, status);
CREATE INDEX IF NOT EXISTS idx_asr_status ON admin_seat_requests(status, created_at DESC);

-- ============================================================
-- ADMIN SEAT PRICE in platform_settings
-- ============================================================
INSERT INTO platform_settings (key, value, label, description, category)
VALUES (
  'admin_seat_price_usd',
  '100',
  'Admin Seat Price (USD)',
  'One-time fee per institution admin account purchased. Each admin seat grants one institution_admin role slot.',
  'pricing'
)
ON CONFLICT (key) DO UPDATE
  SET label       = EXCLUDED.label,
      description = EXCLUDED.description,
      category    = EXCLUDED.category;
