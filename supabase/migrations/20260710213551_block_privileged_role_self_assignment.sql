-- Prevent users from self-assigning privileged roles during sign-up.
-- Only super_admin can insert profiles with institution_admin or super_admin roles.
-- This closes the privilege escalation vulnerability where anyone could POST
-- an institution_admin profile directly via the API.

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;

CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id
    AND role IN ('student', 'supervisor', 'coordinator', 'examiner', 'peer_reviewer')
  );
