import { UserRole, ProjectStage, ProjectType } from '@/types';

export const APP_NAME = 'ResearchFlow';
export const APP_TAGLINE = 'Complete Research Lifecycle Management Platform';
export const APP_DESCRIPTION =
  'ResearchFlow digitizes and automates the entire academic research lifecycle for universities and research institutions worldwide.';

export const BRAND = {
  primary: '#0B5ED7',
  secondary: '#198754',
  accent: '#FFC107',
} as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Student',
  supervisor: 'Supervisor',
  coordinator: 'Research Coordinator',
  examiner: 'Examiner',
  peer_reviewer: 'Peer Reviewer',
  institution_admin: 'Institution Administrator',
  super_admin: 'Platform Administrator',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  student: 'Manage your research projects and track progress',
  supervisor: 'Supervise student research and provide guidance',
  coordinator: 'Coordinate research programs and workflows',
  examiner: 'Review and examine research defenses',
  peer_reviewer: 'Conduct peer review of research papers',
  institution_admin: 'Administer your institution settings and users',
  super_admin: 'Manage all institutions and platform settings',
};

export const STAGE_LABELS: Record<ProjectStage, string> = {
  concept_paper: 'Concept Paper',
  proposal_development: 'Proposal Development',
  proposal_defense: 'Proposal Defense',
  data_collection: 'Data Collection',
  report_development: 'Report Development',
  final_defense: 'Final Defense',
  corrections: 'Corrections',
  peer_review: 'Peer Review',
  publication: 'Publication',
  repository: 'Repository Submission',
  completed: 'Completed',
};

export const STAGE_ORDER: ProjectStage[] = [
  'concept_paper',
  'proposal_development',
  'proposal_defense',
  'data_collection',
  'report_development',
  'final_defense',
  'corrections',
  'peer_review',
  'publication',
  'repository',
  'completed',
];

export const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-700',
  revision_required: 'bg-orange-100 text-orange-800',
  in_progress: 'bg-sky-100 text-sky-800',
  completed: 'bg-emerald-100 text-emerald-800',
} as const;

export const PAGINATION_DEFAULT = 10;
export const PAGINATION_OPTIONS = [10, 25, 50, 100];

export const INSTITUTION_TYPES = [
  { value: 'university', label: 'University' },
  { value: 'college', label: 'College' },
  { value: 'tvet', label: 'TVET Institution' },
  { value: 'research_org', label: 'Research Organization' },
];

// ============================================================
// PRICING MODEL
// These are the code-level defaults. The live values are stored
// in the platform_settings table and editable by the super admin
// without a deployment. These constants are used as fallbacks
// when the DB values cannot be reached (e.g. landing page SSG).
// ============================================================
export const PRICING_DEFAULTS = {
  /** Annual fee per enrolled student (USD) */
  pricePerStudentUsd: 10,
  /** Annual base fee per institution covering all non-student staff (USD) */
  annualBaseFeeUsd: 100,
  /** One-time fee per admin seat purchased by an institution */
  adminSeatPriceUsd: 100,
  /** Trial period in days — 0 means no trial */
  trialPeriodDays: 0,
  /** Billing cycle shown to customers */
  billingCycle: 'annual' as 'annual' | 'monthly',
  /** Display currency */
  currency: 'USD',
  /** Minimum billable student seats */
  minStudents: 1,
} as const;

/** Keys used in the platform_settings table */
export const PRICING_KEYS = {
  pricePerStudent: 'price_per_student_usd',
  annualBaseFee: 'annual_base_fee_usd',
  adminSeatPrice: 'admin_seat_price_usd',
  trialPeriodDays: 'trial_period_days',
  billingCycle: 'billing_cycle',
  currency: 'currency',
  minStudents: 'min_students',
  studentProjectLicenseKes: 'student_project_license_kes',
  studentExtensionLicenseKes: 'student_extension_license_kes',
  supervisorLicenseKes: 'supervisor_license_kes',
  supervisorLicenseYears: 'supervisor_license_years',
} as const;

// ============================================================
// PROJECT TYPES
// ============================================================
export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  undergraduate: 'Undergraduate Project',
  masters_thesis: "Master's Thesis",
  phd_dissertation: 'PhD Dissertation',
};

export const PROJECT_TYPE_DURATIONS: Record<ProjectType, number | null> = {
  undergraduate: 6,      // Fixed 6 months
  masters_thesis: null,  // Student selects 4–12 months
  phd_dissertation: 24,  // Fixed 24 months
};

/** Selectable durations for Master's thesis (months) */
export const MASTERS_DURATION_OPTIONS = [4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

// ============================================================
// KES PRICING DEFAULTS (fallback when DB not reachable)
// ============================================================
export const KES_PRICING = {
  studentProjectLicense: 1000,
  studentExtension: 1000,
  supervisorLicense: 3000,
  supervisorLicenseYears: 3,
} as const;

export const PAYMENT_METHOD_LABELS = {
  mpesa: 'M-Pesa',
  debit_card: 'Debit Card',
  credit_card: 'Credit Card',
  bank_transfer: 'Bank Transfer',
} as const;

// ============================================================
// DEADLINE STATUS
// ============================================================
export const DEADLINE_STATUS_LABELS = {
  ahead_of_schedule: 'Ahead of Schedule',
  on_track: 'On Track',
  behind_schedule: 'Behind Schedule',
  overdue: 'Overdue',
} as const;

export const DEADLINE_STATUS_COLORS = {
  ahead_of_schedule: 'bg-emerald-100 text-emerald-700',
  on_track: 'bg-green-100 text-green-700',
  behind_schedule: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-700',
} as const;

// ============================================================
// AI PLANNER — research phase definitions
// Used to assign phase names to milestones by month position
// ============================================================
export const RESEARCH_PHASES = [
  { id: 'foundation', label: 'Foundation & Planning' },
  { id: 'literature', label: 'Literature Review' },
  { id: 'methodology', label: 'Research Design & Methodology' },
  { id: 'data_collection', label: 'Data Collection' },
  { id: 'analysis', label: 'Data Analysis' },
  { id: 'writing', label: 'Writing & Reporting' },
  { id: 'review', label: 'Review & Defense Preparation' },
  { id: 'finalization', label: 'Finalization & Submission' },
] as const;
