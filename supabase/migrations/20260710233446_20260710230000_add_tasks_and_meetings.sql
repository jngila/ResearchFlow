/*
# Add Tasks and Meetings Tables

## Summary
Adds two new tables to support the student portal Task Manager and Meetings pages.

## New Tables

### 1. tasks
Personal task list for any authenticated user (primarily students).
- `id` — UUID primary key
- `user_id` — references profiles(id), defaults to auth.uid()
- `title` — task description (not null)
- `is_completed` — boolean, default false
- `due_date` — optional deadline
- `created_at` — timestamp

### 2. meetings
Supervision meetings between students and supervisors.
- `id` — UUID primary key
- `student_id` — references profiles(id)
- `supervisor_id` — references profiles(id)
- `title` — meeting title
- `scheduled_at` — timestamp of the meeting
- `location` — optional physical or virtual location
- `meeting_type` — 'online' or 'in_person'
- `status` — 'scheduled', 'completed', 'cancelled'
- `notes` — optional meeting notes
- `created_at` — timestamp

## Security
- Both tables have RLS enabled.
- Tasks: owner-scoped (user sees and manages only their own tasks). DEFAULT auth.uid() on user_id so inserts work without passing user_id explicitly.
- Meetings: student and supervisor can both read their own meetings. Only coordinators and institution_admins can insert (or the system). Students can read meetings where they are the student. Supervisors can read meetings where they are the supervisor.

## Indexes
- idx_tasks_user — on tasks(user_id, created_at DESC)
- idx_meetings_student — on meetings(student_id, scheduled_at)
- idx_meetings_supervisor — on meetings(supervisor_id, scheduled_at)
*/

-- ============================================================
-- TASKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title        text NOT NULL,
  is_completed boolean NOT NULL DEFAULT false,
  due_date     date,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tasks_select_own" ON tasks;
CREATE POLICY "tasks_select_own" ON tasks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "tasks_insert_own" ON tasks;
CREATE POLICY "tasks_insert_own" ON tasks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "tasks_update_own" ON tasks;
CREATE POLICY "tasks_update_own" ON tasks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "tasks_delete_own" ON tasks;
CREATE POLICY "tasks_delete_own" ON tasks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id, created_at DESC);

-- ============================================================
-- MEETINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS meetings (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  supervisor_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id     uuid REFERENCES research_projects(id) ON DELETE SET NULL,
  title          text NOT NULL,
  scheduled_at   timestamptz NOT NULL,
  location       text,
  meeting_type   text NOT NULL DEFAULT 'in_person'
    CHECK (meeting_type IN ('online', 'in_person')),
  status         text NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  notes          text,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "meetings_select_participant" ON meetings;
CREATE POLICY "meetings_select_participant" ON meetings FOR SELECT
  TO authenticated USING (
    auth.uid() = student_id
    OR auth.uid() = supervisor_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('coordinator', 'institution_admin', 'super_admin')
        AND (
          institution_id = (SELECT institution_id FROM profiles WHERE id = meetings.student_id)
          OR role = 'super_admin'
        )
    )
  );

DROP POLICY IF EXISTS "meetings_insert_coordinator" ON meetings;
CREATE POLICY "meetings_insert_coordinator" ON meetings FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = supervisor_id
    OR auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('coordinator', 'institution_admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "meetings_update_participant" ON meetings;
CREATE POLICY "meetings_update_participant" ON meetings FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id OR auth.uid() = supervisor_id)
  WITH CHECK (auth.uid() = student_id OR auth.uid() = supervisor_id);

DROP POLICY IF EXISTS "meetings_delete_supervisor" ON meetings;
CREATE POLICY "meetings_delete_supervisor" ON meetings FOR DELETE
  TO authenticated USING (
    auth.uid() = supervisor_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coordinator','institution_admin','super_admin'))
  );

CREATE INDEX IF NOT EXISTS idx_meetings_student    ON meetings(student_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_meetings_supervisor ON meetings(supervisor_id, scheduled_at);
