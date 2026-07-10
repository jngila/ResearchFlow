/*
# Student & Supervisor ResearchFlow ID System + Profile Enhancements

## Summary
Adds the ResearchFlow unique identifier system for students (RFS-YYYY-XXXXXX) and
supervisors/professionals (RFP-YYYY-XXXXXX). Also adds university linkage via foreign key
to the new `universities` table, plus additional student profile fields collected at registration.

## Modified Tables

### `profiles` — New Columns Added
| Column              | Type    | Description                                             |
|---------------------|---------|---------------------------------------------------------|
| university_id       | uuid    | FK to universities.id — replaces free-text university   |
| researchflow_id     | text    | Auto-generated unique platform ID (RFS/RFP-YYYY-XXXXXX)|
| registration_number | text    | Student's university registration number (optional)     |
| school_faculty      | text    | Faculty or school within the university                 |
| programme           | text    | Degree programme name (e.g. MSc Computer Science)       |
| level_of_study      | text    | undergraduate / masters / phd                           |

## New Database Objects
- `rfs_id_seq` — sequence for RFS (student) ID numbering (global, not per-year)
- `rfp_id_seq` — sequence for RFP (professional/supervisor) ID numbering
- `generate_researchflow_id()` — trigger function that auto-assigns RFS or RFP ID on INSERT
- `trg_profiles_researchflow_id` — BEFORE INSERT trigger on profiles

## ID Format
- Students:     RFS-YYYY-XXXXXX  (e.g. RFS-2026-000001)
- Supervisors:  RFP-YYYY-XXXXXX  (e.g. RFP-2026-000014)
- YYYY = year of registration
- XXXXXX = globally sequential 6-digit zero-padded number

## Notes
1. The ResearchFlow ID is set automatically by the database trigger — the application
   never generates or passes this value.
2. The sequence is global (not reset per year), ensuring IDs are always unique.
3. `university_id` is nullable so existing profiles without a university are not broken.
4. `level_of_study` only applies to students but is stored for all roles as nullable.
5. The RLS policies on profiles already exist; this migration only adds columns and the trigger.
*/

-- ============================================================
-- Sequences for ID generation
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS rfs_id_seq START 1 INCREMENT 1;
CREATE SEQUENCE IF NOT EXISTS rfp_id_seq START 1 INCREMENT 1;

-- ============================================================
-- Add new columns to profiles (idempotent via DO block)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'university_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN university_id uuid REFERENCES universities(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'researchflow_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN researchflow_id text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'registration_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN registration_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'school_faculty'
  ) THEN
    ALTER TABLE profiles ADD COLUMN school_faculty text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'programme'
  ) THEN
    ALTER TABLE profiles ADD COLUMN programme text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'level_of_study'
  ) THEN
    ALTER TABLE profiles ADD COLUMN level_of_study text
      CHECK (level_of_study IS NULL OR level_of_study IN ('undergraduate', 'masters', 'phd'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_university_id   ON profiles(university_id);
CREATE INDEX IF NOT EXISTS idx_profiles_researchflow_id ON profiles(researchflow_id);

-- ============================================================
-- Trigger function: auto-generate ResearchFlow ID on INSERT
-- ============================================================
CREATE OR REPLACE FUNCTION generate_researchflow_id()
RETURNS TRIGGER AS $$
DECLARE
  v_year   text;
  v_seq    bigint;
  v_prefix text;
  v_id     text;
BEGIN
  -- Only generate if not already set (allows manual override in tests)
  IF NEW.researchflow_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  v_year := to_char(now() AT TIME ZONE 'Africa/Nairobi', 'YYYY');

  IF NEW.role = 'student' THEN
    v_prefix := 'RFS';
    v_seq    := nextval('rfs_id_seq');
  ELSE
    v_prefix := 'RFP';
    v_seq    := nextval('rfp_id_seq');
  END IF;

  NEW.researchflow_id := v_prefix || '-' || v_year || '-' || lpad(v_seq::text, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Attach trigger to profiles
-- ============================================================
DROP TRIGGER IF EXISTS trg_profiles_researchflow_id ON profiles;
CREATE TRIGGER trg_profiles_researchflow_id
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_researchflow_id();

-- ============================================================
-- Back-fill existing profiles that don't have a ResearchFlow ID
-- ============================================================
DO $$
DECLARE
  rec    RECORD;
  v_year text;
  v_seq  bigint;
BEGIN
  FOR rec IN
    SELECT id, role, created_at
    FROM   profiles
    WHERE  researchflow_id IS NULL
    ORDER  BY created_at
  LOOP
    v_year := to_char(rec.created_at AT TIME ZONE 'Africa/Nairobi', 'YYYY');
    IF rec.role = 'student' THEN
      v_seq := nextval('rfs_id_seq');
      UPDATE profiles
      SET    researchflow_id = 'RFS-' || v_year || '-' || lpad(v_seq::text, 6, '0')
      WHERE  id = rec.id;
    ELSE
      v_seq := nextval('rfp_id_seq');
      UPDATE profiles
      SET    researchflow_id = 'RFP-' || v_year || '-' || lpad(v_seq::text, 6, '0')
      WHERE  id = rec.id;
    END IF;
  END LOOP;
END $$;
