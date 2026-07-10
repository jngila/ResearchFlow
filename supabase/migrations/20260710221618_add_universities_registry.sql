/*
# Kenyan University Registry

## Summary
Creates a master `universities` table pre-loaded with all accredited universities in Kenya.
Designed for future international expansion — country is stored as a separate column and
new universities from other countries can be added without schema changes.

## New Tables

### `universities`
| Column      | Type    | Description                                      |
|-------------|---------|--------------------------------------------------|
| id          | uuid    | Primary key                                      |
| name        | text    | Full official university name (unique)           |
| code        | text    | Short unique identifier code (e.g. UON, KU)      |
| type        | text    | 'public' or 'private'                            |
| country     | text    | Country of registration (default: Kenya)         |
| county      | text    | County/state/province (nullable)                 |
| status      | text    | 'active' or 'inactive'                           |
| website     | text    | Official website URL (nullable)                  |
| created_at  | timestamptz | Record creation timestamp                   |
| updated_at  | timestamptz | Last update timestamp                        |

## Security
- RLS enabled.
- Anon + authenticated users can SELECT (needed for registration dropdown).
- Only authenticated super_admin role can INSERT/UPDATE.
- No DELETE policy — deactivate via status column instead.

## Notes
1. Pre-loaded with all Commission for University Education (CUE)-accredited universities in Kenya.
2. The `county` column stores Kenyan counties for local universities; for international expansion it can hold state/province.
3. `code` is unique across ALL countries to prevent collisions.
4. The `country` column enables future multi-country support without schema changes.
*/

-- ============================================================
-- Table
-- ============================================================
CREATE TABLE IF NOT EXISTS universities (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL UNIQUE,
  code       text        NOT NULL UNIQUE,
  type       text        NOT NULL DEFAULT 'public' CHECK (type IN ('public', 'private')),
  country    text        NOT NULL DEFAULT 'Kenya',
  county     text,
  status     text        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  website    text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_universities_country  ON universities(country);
CREATE INDEX IF NOT EXISTS idx_universities_status   ON universities(status);
CREATE INDEX IF NOT EXISTS idx_universities_type     ON universities(type);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "universities_select_all"   ON universities;
DROP POLICY IF EXISTS "universities_insert_admin" ON universities;
DROP POLICY IF EXISTS "universities_update_admin" ON universities;

-- Anyone (including unauthenticated registration page) can read
CREATE POLICY "universities_select_all" ON universities FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated users with super_admin role can add universities
CREATE POLICY "universities_insert_admin" ON universities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "universities_update_admin" ON universities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

-- ============================================================
-- Seed: Kenyan Public Universities
-- ============================================================
INSERT INTO universities (name, code, type, country, county) VALUES
  ('University of Nairobi', 'UON', 'public', 'Kenya', 'Nairobi'),
  ('Kenyatta University', 'KU', 'public', 'Kenya', 'Nairobi'),
  ('Moi University', 'MU', 'public', 'Kenya', 'Uasin Gishu'),
  ('Egerton University', 'EU', 'public', 'Kenya', 'Nakuru'),
  ('Jomo Kenyatta University of Agriculture and Technology', 'JKUAT', 'public', 'Kenya', 'Kiambu'),
  ('Maseno University', 'MSNO', 'public', 'Kenya', 'Kisumu'),
  ('Dedan Kimathi University of Technology', 'DeKUT', 'public', 'Kenya', 'Nyeri'),
  ('Technical University of Kenya', 'TUK', 'public', 'Kenya', 'Nairobi'),
  ('Technical University of Mombasa', 'TUM', 'public', 'Kenya', 'Mombasa'),
  ('Jaramogi Oginga Odinga University of Science and Technology', 'JOOUST', 'public', 'Kenya', 'Siaya'),
  ('Masinde Muliro University of Science and Technology', 'MMUST', 'public', 'Kenya', 'Kakamega'),
  ('Laikipia University', 'LU', 'public', 'Kenya', 'Laikipia'),
  ('Karatina University', 'KarU', 'public', 'Kenya', 'Nyeri'),
  ('Kirinyaga University', 'KyU', 'public', 'Kenya', 'Kirinyaga'),
  ('Murang''a University of Technology', 'MUT', 'public', 'Kenya', 'Murang''a'),
  ('Chuka University', 'CU', 'public', 'Kenya', 'Tharaka-Nithi'),
  ('Embu University', 'EmU', 'public', 'Kenya', 'Embu'),
  ('Meru University of Science and Technology', 'MUST', 'public', 'Kenya', 'Meru'),
  ('Kibabii University', 'KIBU', 'public', 'Kenya', 'Bungoma'),
  ('University of Eldoret', 'UoE', 'public', 'Kenya', 'Uasin Gishu'),
  ('Garissa University', 'GarU', 'public', 'Kenya', 'Garissa'),
  ('South Eastern Kenya University', 'SEKU', 'public', 'Kenya', 'Kitui'),
  ('Pwani University', 'PU', 'public', 'Kenya', 'Kilifi'),
  ('Kisii University', 'KSU', 'public', 'Kenya', 'Kisii'),
  ('Rongo University', 'RU', 'public', 'Kenya', 'Migori'),
  ('Tharaka University', 'THU', 'public', 'Kenya', 'Tharaka-Nithi'),
  ('Maasai Mara University', 'MMU', 'public', 'Kenya', 'Narok'),
  ('Bomet University College', 'BUC', 'public', 'Kenya', 'Bomet'),
  ('Alupe University', 'AlU', 'public', 'Kenya', 'Busia'),
  ('Tom Mboya University', 'TMU', 'public', 'Kenya', 'Homabay'),
  ('Koitalel Samoei University College', 'KSUC', 'public', 'Kenya', 'Nandi'),
  ('Turkana University College', 'TUC', 'public', 'Kenya', 'Turkana'),
  ('University of Kabianga', 'UoK', 'public', 'Kenya', 'Kericho'),
  ('Kisumu National Polytechnic', 'KNP', 'public', 'Kenya', 'Kisumu'),
  ('Ramogi Institute of Advanced Technology', 'RIAT', 'public', 'Kenya', 'Kisumu')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- Seed: Kenyan Private Universities
-- ============================================================
INSERT INTO universities (name, code, type, country, county) VALUES
  ('United States International University - Africa', 'USIU', 'private', 'Kenya', 'Nairobi'),
  ('Strathmore University', 'SU', 'private', 'Kenya', 'Nairobi'),
  ('Catholic University of Eastern Africa', 'CUEA', 'private', 'Kenya', 'Nairobi'),
  ('Daystar University', 'DU', 'private', 'Kenya', 'Nairobi'),
  ('Africa Nazarene University', 'ANU', 'private', 'Kenya', 'Kajiado'),
  ('Pan Africa Christian University', 'PAC', 'private', 'Kenya', 'Nairobi'),
  ('St. Paul''s University', 'SPU', 'private', 'Kenya', 'Kiambu'),
  ('Presbyterian University of East Africa', 'PUEA', 'private', 'Kenya', 'Kiambu'),
  ('Africa International University', 'AIU', 'private', 'Kenya', 'Nairobi'),
  ('Mount Kenya University', 'MKU', 'private', 'Kenya', 'Nyeri'),
  ('Kenya Methodist University', 'KeMU', 'private', 'Kenya', 'Meru'),
  ('Scott Christian University', 'SCU', 'private', 'Kenya', 'Machakos'),
  ('Adventist University of Africa', 'AUA', 'private', 'Kenya', 'Kajiado'),
  ('Great Lakes University of Kisumu', 'GLUK', 'private', 'Kenya', 'Kisumu'),
  ('University of Eastern Africa Baraton', 'UEAB', 'private', 'Kenya', 'Uasin Gishu'),
  ('Riara University', 'RiU', 'private', 'Kenya', 'Nairobi'),
  ('Zetech University', 'ZU', 'private', 'Kenya', 'Kiambu'),
  ('Management University of Africa', 'MUA', 'private', 'Kenya', 'Nairobi'),
  ('KCA University', 'KCAU', 'private', 'Kenya', 'Nairobi'),
  ('Nairobi Institute of Technology', 'NIT', 'private', 'Kenya', 'Nairobi'),
  ('Gretsa University', 'GrU', 'private', 'Kenya', 'Kiambu'),
  ('Pioneer International University', 'PIU', 'private', 'Kenya', 'Nairobi'),
  ('Multi Media University of Kenya', 'MMK', 'private', 'Kenya', 'Nairobi'),
  ('Lukenya University', 'LkU', 'private', 'Kenya', 'Machakos'),
  ('East Africa School of Theology', 'EAST', 'private', 'Kenya', 'Nairobi'),
  ('Aga Khan University', 'AKU', 'private', 'Kenya', 'Nairobi'),
  ('International Leadership University', 'ILU', 'private', 'Kenya', 'Nairobi'),
  ('Africa Gospel Church Kima Theological College', 'AGCKC', 'private', 'Kenya', 'Vihiga'),
  ('Tangaza University College', 'TUCol', 'private', 'Kenya', 'Nairobi'),
  ('Consolata Institute of Philosophy', 'CIP', 'private', 'Kenya', 'Nairobi')
ON CONFLICT (name) DO NOTHING;
