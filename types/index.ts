// ============================================================
// Core application types for ResearchFlow
// ============================================================

export type UserRole =
  | 'student'
  | 'supervisor'
  | 'coordinator'
  | 'examiner'
  | 'peer_reviewer'
  | 'institution_admin'
  | 'super_admin';

export type ProjectType =
  | 'undergraduate'
  | 'masters_thesis'
  | 'phd_dissertation';

export type ProjectStage =
  | 'concept_paper'
  | 'proposal_development'
  | 'proposal_defense'
  | 'data_collection'
  | 'report_development'
  | 'final_defense'
  | 'corrections'
  | 'peer_review'
  | 'publication'
  | 'repository'
  | 'completed';

export type ProjectStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'revision_required'
  | 'in_progress'
  | 'completed';

export type ProjectLifecycleStatus =
  | 'active'
  | 'expired'
  | 'completed'
  | 'suspended';

export type DeadlineStatus =
  | 'ahead_of_schedule'
  | 'on_track'
  | 'behind_schedule'
  | 'overdue';

export type DocumentType =
  | 'concept_paper'
  | 'proposal'
  | 'report'
  | 'presentation'
  | 'letter'
  | 'rubric'
  | 'other';

export type PaymentMethod =
  | 'mpesa'
  | 'debit_card'
  | 'credit_card'
  | 'bank_transfer';

export type PaymentType =
  | 'student_project_license'
  | 'student_project_extension'
  | 'supervisor_license'
  | 'admin_seat';

export type PaymentStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded';

export type LicenseStatus =
  | 'pending'
  | 'active'
  | 'expired'
  | 'refunded';

export type MilestoneStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'overdue'
  | 'skipped';

export type LevelOfStudy =
  | 'undergraduate'
  | 'masters'
  | 'phd';

export interface University {
  id: string;
  name: string;
  code: string;
  type: 'public' | 'private';
  country: string;
  county?: string;
  status: 'active' | 'inactive';
  website?: string;
  created_at: string;
  updated_at: string;
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  country: string;
  type: 'university' | 'college' | 'tvet' | 'research_org';
  subscription_status: 'trial' | 'active' | 'suspended' | 'expired';
  admin_seats_purchased?: number;
  created_at: string;
}

export interface User {
  id: string;
  institution_id: string;
  university_id?: string;
  email: string;
  full_name: string;
  role: UserRole;
  researchflow_id?: string;
  avatar_url?: string;
  department?: string;
  faculty?: string;
  school_faculty?: string;
  programme?: string;
  level_of_study?: LevelOfStudy;
  registration_number?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface ResearchProject {
  id: string;
  institution_id: string;
  student_id: string;
  title: string;
  abstract?: string;
  field_of_study: string;
  program: string;
  project_type: ProjectType;
  selected_duration_months?: number;
  project_start_date?: string;
  project_deadline?: string;
  project_status: ProjectLifecycleStatus;
  extension_count: number;
  supervisor_id?: string;
  co_supervisor_id?: string;
  current_stage: ProjectStage;
  status: ProjectStatus;
  progress_percentage: number;
  start_date?: string;
  expected_completion?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  phase: string;
  month_number: number;
  week_number?: number;
  due_date: string;
  status: MilestoneStatus;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  institution_id?: string;
  user_id: string;
  project_id?: string;
  payment_type: PaymentType;
  amount_kes: number;
  payment_method: PaymentMethod;
  payment_reference?: string;
  payment_status: PaymentStatus;
  receipt_number?: string;
  payment_date?: string;
  created_at: string;
}

export interface StudentLicense {
  id: string;
  user_id: string;
  project_id: string;
  payment_id?: string;
  license_type: 'project_license' | 'project_extension';
  purchase_date: string;
  expiry_date: string;
  payment_status: LicenseStatus;
  created_at: string;
}

export interface SupervisorLicense {
  id: string;
  user_id: string;
  payment_id?: string;
  purchase_date: string;
  expiry_date: string;
  renewal_date?: string;
  payment_status: LicenseStatus;
  created_at: string;
}

export interface WorkflowStage {
  id: string;
  project_id: string;
  stage: ProjectStage;
  status: ProjectStatus;
  assigned_users: string[];
  deadline?: string;
  completed_at?: string;
  documents: string[];
  comments_count: number;
  progress: number;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export interface Document {
  id: string;
  project_id: string;
  uploaded_by: string;
  name: string;
  type: DocumentType;
  file_url: string;
  file_size: number;
  version: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  created_at: string;
}

export interface DashboardStats {
  total: number;
  active: number;
  pending: number;
  completed: number;
  overdue: number;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
}
