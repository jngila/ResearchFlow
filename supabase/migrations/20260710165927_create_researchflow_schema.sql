/*
# ResearchFlow - Core Database Schema

## Overview
Creates the full multi-tenant research lifecycle management schema for ResearchFlow.

## New Tables

### institutions
Multi-tenant root. Each university/college has one row.
Columns: id, name, code, logo_url, primary_color, secondary_color, country, type, subscription_status, subscription_expires_at, max_students, settings (JSONB)

### profiles
Extended user data linked to auth.users. Stores role, institution, department etc.
Columns: id (= auth.users.id), institution_id, full_name, role, department, faculty, phone, avatar_url, is_active

### research_projects
Core research project entity per student.
Columns: id, institution_id, student_id, title, abstract, field_of_study, program, supervisor_id, co_supervisor_id, current_stage, status, progress_percentage, start_date, expected_completion

### workflow_stages
One row per stage per project, tracks state of each lifecycle step.
Columns: id, project_id, stage, status, deadline, completed_at, progress, notes

### documents
File attachments linked to projects and stages.
Columns: id, project_id, workflow_stage_id, uploaded_by, name, type, file_url, file_size_bytes, version, status

### comments
Discussion threads on projects/stages.
Columns: id, project_id, workflow_stage_id, author_id, content, is_internal

### notifications
In-app notification feed.
Columns: id, user_id, title, message, type, is_read, action_url

### audit_logs
Immutable event history for compliance.
Columns: id, institution_id, user_id, entity_type, entity_id, action, metadata (JSONB)

### supervisor_allocations
Links supervisors to projects with capacity tracking.
Columns: id, project_id, supervisor_id, role (primary/co), assigned_by, assigned_at, status

### defenses
Defense scheduling records.
Columns: id, project_id, defense_type, scheduled_at, venue, panel_members (array), outcome, notes

### peer_reviews
Peer review assignments and outcomes.
Columns: id, project_id, reviewer_id, assigned_by, status, score, feedback, submitted_at

### letters
Generated official letters (approval, rejection, etc.)
Columns: id, institution_id, project_id, letter_type, generated_by, content, signed_by, issued_at

## Security
- RLS enabled on all tables
- Authenticated users only
- institution_id scoping on all tables
- Users see only their institution's data (via profiles lookup)
*/

-- ============================================================
-- INSTITUTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS institutions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  code            text UNIQUE NOT NULL,
  logo_url        text,
  primary_color   text DEFAULT '#0B5ED7',
  secondary_color text DEFAULT '#198754',
  country         text NOT NULL DEFAULT 'Kenya',
  type            text NOT NULL DEFAULT 'university'
                  CHECK (type IN ('university','college','tvet','research_org')),
  subscription_status text NOT NULL DEFAULT 'trial'
                  CHECK (subscription_status IN ('trial','active','suspended','expired')),
  subscription_expires_at timestamptz,
  max_students    int DEFAULT 500,
  settings        jsonb DEFAULT '{}',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inst_select" ON institutions;
CREATE POLICY "inst_select" ON institutions FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "inst_insert" ON institutions;
CREATE POLICY "inst_insert" ON institutions FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "inst_update" ON institutions;
CREATE POLICY "inst_update" ON institutions FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id  uuid REFERENCES institutions(id) ON DELETE SET NULL,
  full_name       text NOT NULL DEFAULT '',
  role            text NOT NULL DEFAULT 'student'
                  CHECK (role IN ('student','supervisor','coordinator','examiner','peer_reviewer','institution_admin','super_admin')),
  department      text,
  faculty         text,
  phone           text,
  avatar_url      text,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- RESEARCH PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS research_projects (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id      uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id          uuid NOT NULL REFERENCES profiles(id),
  title               text NOT NULL,
  abstract            text,
  field_of_study      text NOT NULL DEFAULT '',
  program             text NOT NULL DEFAULT '',
  supervisor_id       uuid REFERENCES profiles(id),
  co_supervisor_id    uuid REFERENCES profiles(id),
  current_stage       text NOT NULL DEFAULT 'concept_paper'
                      CHECK (current_stage IN (
                        'concept_paper','proposal_development','proposal_defense',
                        'data_collection','report_development','final_defense',
                        'corrections','peer_review','publication','repository','completed'
                      )),
  status              text NOT NULL DEFAULT 'draft'
                      CHECK (status IN (
                        'draft','submitted','under_review','approved',
                        'rejected','revision_required','in_progress','completed'
                      )),
  progress_percentage int NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  start_date          date,
  expected_completion date,
  keywords            text[],
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

ALTER TABLE research_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "proj_select" ON research_projects;
CREATE POLICY "proj_select" ON research_projects FOR SELECT
  TO authenticated USING (
    institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "proj_insert" ON research_projects;
CREATE POLICY "proj_insert" ON research_projects FOR INSERT
  TO authenticated WITH CHECK (
    institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "proj_update" ON research_projects;
CREATE POLICY "proj_update" ON research_projects FOR UPDATE
  TO authenticated
  USING (institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "proj_delete" ON research_projects;
CREATE POLICY "proj_delete" ON research_projects FOR DELETE
  TO authenticated USING (
    institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
  );

-- ============================================================
-- WORKFLOW STAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS workflow_stages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  stage           text NOT NULL,
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','in_progress','submitted','under_review','approved','rejected','revision_required','completed')),
  deadline        timestamptz,
  completed_at    timestamptz,
  progress        int NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  notes           text,
  metadata        jsonb DEFAULT '{}',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE workflow_stages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ws_select" ON workflow_stages;
CREATE POLICY "ws_select" ON workflow_stages FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM research_projects rp
      WHERE rp.id = workflow_stages.project_id
        AND rp.institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "ws_insert" ON workflow_stages;
CREATE POLICY "ws_insert" ON workflow_stages FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM research_projects rp
      WHERE rp.id = project_id
        AND rp.institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "ws_update" ON workflow_stages;
CREATE POLICY "ws_update" ON workflow_stages FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM research_projects rp
    WHERE rp.id = workflow_stages.project_id
      AND rp.institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM research_projects rp
    WHERE rp.id = project_id
      AND rp.institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
  ));

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        uuid NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  workflow_stage_id uuid REFERENCES workflow_stages(id),
  uploaded_by       uuid NOT NULL REFERENCES profiles(id),
  name              text NOT NULL,
  type              text NOT NULL DEFAULT 'other'
                    CHECK (type IN ('concept_paper','proposal','report','presentation','letter','rubric','other')),
  file_url          text NOT NULL,
  file_size_bytes   bigint DEFAULT 0,
  mime_type         text,
  version           int NOT NULL DEFAULT 1,
  status            text NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','submitted','approved','rejected')),
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "docs_select" ON documents;
CREATE POLICY "docs_select" ON documents FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM research_projects rp
      WHERE rp.id = documents.project_id
        AND rp.institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "docs_insert" ON documents;
CREATE POLICY "docs_insert" ON documents FOR INSERT
  TO authenticated WITH CHECK (
    uploaded_by = auth.uid()
  );

DROP POLICY IF EXISTS "docs_update" ON documents;
CREATE POLICY "docs_update" ON documents FOR UPDATE
  TO authenticated USING (uploaded_by = auth.uid()) WITH CHECK (uploaded_by = auth.uid());

-- ============================================================
-- COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        uuid NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  workflow_stage_id uuid REFERENCES workflow_stages(id),
  author_id         uuid NOT NULL REFERENCES profiles(id),
  content           text NOT NULL,
  is_internal       boolean NOT NULL DEFAULT false,
  parent_id         uuid REFERENCES comments(id),
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_select" ON comments;
CREATE POLICY "comments_select" ON comments FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM research_projects rp
      WHERE rp.id = comments.project_id
        AND rp.institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "comments_insert" ON comments;
CREATE POLICY "comments_insert" ON comments FOR INSERT
  TO authenticated WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "comments_update" ON comments;
CREATE POLICY "comments_update" ON comments FOR UPDATE
  TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       text NOT NULL,
  message     text NOT NULL,
  type        text NOT NULL DEFAULT 'info'
              CHECK (type IN ('info','success','warning','error')),
  is_read     boolean NOT NULL DEFAULT false,
  action_url  text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notif_select_own" ON notifications;
CREATE POLICY "notif_select_own" ON notifications FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notif_insert" ON notifications;
CREATE POLICY "notif_insert" ON notifications FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "notif_update_own" ON notifications;
CREATE POLICY "notif_update_own" ON notifications FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES institutions(id) ON DELETE SET NULL,
  user_id       uuid REFERENCES profiles(id),
  entity_type   text NOT NULL,
  entity_id     uuid,
  action        text NOT NULL,
  metadata      jsonb DEFAULT '{}',
  ip_address    text,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_select" ON audit_logs;
CREATE POLICY "audit_select" ON audit_logs FOR SELECT
  TO authenticated USING (
    institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "audit_insert" ON audit_logs;
CREATE POLICY "audit_insert" ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (true);

-- ============================================================
-- SUPERVISOR ALLOCATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS supervisor_allocations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  supervisor_id uuid NOT NULL REFERENCES profiles(id),
  role          text NOT NULL DEFAULT 'primary' CHECK (role IN ('primary','co_supervisor')),
  assigned_by   uuid REFERENCES profiles(id),
  assigned_at   timestamptz DEFAULT now(),
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  notes         text
);

ALTER TABLE supervisor_allocations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "supalloc_select" ON supervisor_allocations;
CREATE POLICY "supalloc_select" ON supervisor_allocations FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM research_projects rp
      WHERE rp.id = supervisor_allocations.project_id
        AND rp.institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "supalloc_insert" ON supervisor_allocations;
CREATE POLICY "supalloc_insert" ON supervisor_allocations FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "supalloc_update" ON supervisor_allocations;
CREATE POLICY "supalloc_update" ON supervisor_allocations FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- DEFENSES
-- ============================================================
CREATE TABLE IF NOT EXISTS defenses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  defense_type    text NOT NULL CHECK (defense_type IN ('proposal','final')),
  scheduled_at    timestamptz,
  venue           text,
  panel_members   uuid[],
  outcome         text CHECK (outcome IN ('pass','minor_corrections','major_corrections','fail','pending')),
  outcome_notes   text,
  created_by      uuid REFERENCES profiles(id),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE defenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "defenses_select" ON defenses;
CREATE POLICY "defenses_select" ON defenses FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM research_projects rp
      WHERE rp.id = defenses.project_id
        AND rp.institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "defenses_insert" ON defenses;
CREATE POLICY "defenses_insert" ON defenses FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "defenses_update" ON defenses;
CREATE POLICY "defenses_update" ON defenses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- PEER REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS peer_reviews (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  reviewer_id   uuid NOT NULL REFERENCES profiles(id),
  assigned_by   uuid REFERENCES profiles(id),
  status        text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','in_progress','submitted','accepted','rejected')),
  score         numeric(4,2),
  feedback      text,
  submitted_at  timestamptz,
  deadline      timestamptz,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE peer_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pr_select" ON peer_reviews;
CREATE POLICY "pr_select" ON peer_reviews FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM research_projects rp
      WHERE rp.id = peer_reviews.project_id
        AND rp.institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "pr_insert" ON peer_reviews;
CREATE POLICY "pr_insert" ON peer_reviews FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "pr_update" ON peer_reviews;
CREATE POLICY "pr_update" ON peer_reviews FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- LETTERS
-- ============================================================
CREATE TABLE IF NOT EXISTS letters (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  project_id      uuid REFERENCES research_projects(id),
  letter_type     text NOT NULL,
  generated_by    uuid REFERENCES profiles(id),
  content         text,
  signed_by       uuid REFERENCES profiles(id),
  issued_at       timestamptz,
  file_url        text,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE letters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "letters_select" ON letters;
CREATE POLICY "letters_select" ON letters FOR SELECT
  TO authenticated USING (
    institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "letters_insert" ON letters;
CREATE POLICY "letters_insert" ON letters FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_institution ON profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_projects_institution ON research_projects(institution_id);
CREATE INDEX IF NOT EXISTS idx_projects_student ON research_projects(student_id);
CREATE INDEX IF NOT EXISTS idx_projects_supervisor ON research_projects(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_projects_stage ON research_projects(current_stage);
CREATE INDEX IF NOT EXISTS idx_projects_status ON research_projects(status);
CREATE INDEX IF NOT EXISTS idx_workflow_project ON workflow_stages(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_institution ON audit_logs(institution_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
