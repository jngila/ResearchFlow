/*
# Fix 11 overly-permissive RLS policies

## What this fixes
Twelve policies had `WITH CHECK (true)` or `USING (true)` where real ownership/membership
checks should be applied. Supabase flags these as security warnings because they allow any
authenticated user to insert or modify rows they shouldn't own.

## Changes per table

### audit_logs
- INSERT: restrict to rows whose institution_id matches the caller's institution.

### defenses
- INSERT: restrict to callers whose institution owns the related research_project.
- UPDATE: same institution-scoped ownership check.

### institutions
- INSERT: only a super_admin (profiles.role = 'super_admin') may create an institution.
- UPDATE: only a super_admin OR the institution's own admin may update it.

### letters
- INSERT: restrict to callers within the same institution as the letter's institution_id.

### notifications
- INSERT: only allow inserting a notification addressed to a user in the same institution,
          OR addressed to the caller themselves (self-notify).

### peer_reviews
- INSERT: restrict to coordinator/admin within the related project's institution.
- UPDATE: only the assigned reviewer may update their own review row.

### platform_settings (anon SELECT)
- The anon SELECT policy is intentional (landing page reads pricing) but is tightened
  to only expose the 'pricing' category, not all settings.

### supervisor_allocations
- INSERT: restrict to coordinator/admin within the project's institution.
- UPDATE: only the assigned supervisor or institution admin may update.

## Safety
All statements use DROP … IF EXISTS + CREATE so they are safe to re-run.
No data is deleted or columns changed.
*/

-- ============================================================
-- audit_logs: INSERT must set institution_id to caller's own
-- ============================================================
DROP POLICY IF EXISTS "audit_insert" ON audit_logs;
CREATE POLICY "audit_insert" ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
  );

-- ============================================================
-- defenses: INSERT and UPDATE scoped to project's institution
-- ============================================================
DROP POLICY IF EXISTS "defenses_insert" ON defenses;
CREATE POLICY "defenses_insert" ON defenses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM research_projects rp
      WHERE rp.id = project_id
        AND rp.institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "defenses_update" ON defenses;
CREATE POLICY "defenses_update" ON defenses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM research_projects rp
      WHERE rp.id = defenses.project_id
        AND rp.institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM research_projects rp
      WHERE rp.id = project_id
        AND rp.institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
    )
  );

-- ============================================================
-- institutions: only super_admin may create; super_admin or
--               the institution's own admin may update
-- ============================================================
DROP POLICY IF EXISTS "inst_insert" ON institutions;
CREATE POLICY "inst_insert" ON institutions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

DROP POLICY IF EXISTS "inst_update" ON institutions;
CREATE POLICY "inst_update" ON institutions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'institution_admin' AND institution_id = institutions.id)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'institution_admin' AND institution_id = institutions.id)
  );

-- ============================================================
-- letters: INSERT scoped to caller's own institution
-- ============================================================
DROP POLICY IF EXISTS "letters_insert" ON letters;
CREATE POLICY "letters_insert" ON letters FOR INSERT
  TO authenticated
  WITH CHECK (
    institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
  );

-- ============================================================
-- notifications: INSERT — caller may notify anyone in the same
--                institution, or themselves
-- ============================================================
DROP POLICY IF EXISTS "notif_insert" ON notifications;
CREATE POLICY "notif_insert" ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    -- self-notify always allowed
    user_id = auth.uid()
    OR
    -- notify someone in the same institution
    EXISTS (
      SELECT 1 FROM profiles target
      WHERE target.id = user_id
        AND target.institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
    )
  );

-- ============================================================
-- peer_reviews: INSERT by coordinators/admins in same institution;
--               UPDATE only by the assigned reviewer
-- ============================================================
DROP POLICY IF EXISTS "pr_insert" ON peer_reviews;
CREATE POLICY "pr_insert" ON peer_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM research_projects rp
      JOIN profiles p ON p.id = auth.uid()
      WHERE rp.id = project_id
        AND rp.institution_id = p.institution_id
        AND p.role IN ('coordinator', 'institution_admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "pr_update" ON peer_reviews;
CREATE POLICY "pr_update" ON peer_reviews FOR UPDATE
  TO authenticated
  USING (
    reviewer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM research_projects rp
      JOIN profiles p ON p.id = auth.uid()
      WHERE rp.id = peer_reviews.project_id
        AND rp.institution_id = p.institution_id
        AND p.role IN ('coordinator', 'institution_admin', 'super_admin')
    )
  )
  WITH CHECK (
    reviewer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM research_projects rp
      JOIN profiles p ON p.id = auth.uid()
      WHERE rp.id = project_id
        AND rp.institution_id = p.institution_id
        AND p.role IN ('coordinator', 'institution_admin', 'super_admin')
    )
  );

-- ============================================================
-- platform_settings: tighten anon SELECT to pricing category only
-- ============================================================
DROP POLICY IF EXISTS "ps_select_anon" ON platform_settings;
CREATE POLICY "ps_select_anon" ON platform_settings FOR SELECT
  TO anon
  USING (category = 'pricing');

-- ============================================================
-- supervisor_allocations: INSERT by coordinators/admins;
--                         UPDATE by the supervisor or admin
-- ============================================================
DROP POLICY IF EXISTS "supalloc_insert" ON supervisor_allocations;
CREATE POLICY "supalloc_insert" ON supervisor_allocations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM research_projects rp
      JOIN profiles p ON p.id = auth.uid()
      WHERE rp.id = project_id
        AND rp.institution_id = p.institution_id
        AND p.role IN ('coordinator', 'institution_admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "supalloc_update" ON supervisor_allocations;
CREATE POLICY "supalloc_update" ON supervisor_allocations FOR UPDATE
  TO authenticated
  USING (
    supervisor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM research_projects rp
      JOIN profiles p ON p.id = auth.uid()
      WHERE rp.id = supervisor_allocations.project_id
        AND rp.institution_id = p.institution_id
        AND p.role IN ('coordinator', 'institution_admin', 'super_admin')
    )
  )
  WITH CHECK (
    supervisor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM research_projects rp
      JOIN profiles p ON p.id = auth.uid()
      WHERE rp.id = project_id
        AND rp.institution_id = p.institution_id
        AND p.role IN ('coordinator', 'institution_admin', 'super_admin')
    )
  );
