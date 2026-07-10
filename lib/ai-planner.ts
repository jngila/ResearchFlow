import { addWeeks, addMonths, format, parseISO } from 'date-fns';
import { ProjectType, ProjectMilestone } from '@/types';
import { RESEARCH_PHASES } from './constants';

interface PlannerInput {
  projectId: string;
  projectType: ProjectType;
  startDate: string;
  durationMonths: number;
}

interface GeneratedMilestone extends Omit<ProjectMilestone, 'id' | 'created_at' | 'updated_at'> {}

/**
 * Returns the research phase name for a given month within the project timeline.
 * Phases are distributed proportionally across the duration.
 */
function getPhaseForMonth(month: number, totalMonths: number): string {
  const phaseCount = RESEARCH_PHASES.length;
  const index = Math.min(
    phaseCount - 1,
    Math.floor(((month - 1) / totalMonths) * phaseCount)
  );
  return RESEARCH_PHASES[index].label;
}

/**
 * Milestone templates per phase — text is filled with context
 */
const PHASE_MILESTONES: Record<string, string[]> = {
  'Foundation & Planning': [
    'Project kickoff and orientation meeting with supervisor',
    'Define research problem and objectives',
    'Develop initial research framework',
    'Register project and complete administrative requirements',
  ],
  'Literature Review': [
    'Identify and gather 20+ peer-reviewed sources',
    'Critical analysis of existing literature',
    'Identify research gaps',
    'Complete literature review chapter draft',
  ],
  'Research Design & Methodology': [
    'Select and justify research methodology',
    'Design data collection instruments',
    'Obtain ethics approval (if applicable)',
    'Submit and defend research proposal',
  ],
  'Data Collection': [
    'Pilot test data collection instruments',
    'Execute primary data collection',
    'Conduct field work / surveys / experiments',
    'Verify and clean collected data',
  ],
  'Data Analysis': [
    'Analyse data using selected tools',
    'Interpret quantitative / qualitative results',
    'Validate findings with supervisor',
    'Prepare data analysis chapter draft',
  ],
  'Writing & Reporting': [
    'Write results and findings chapter',
    'Write discussion and conclusions chapter',
    'Compile complete thesis draft',
    'Submit draft to supervisor for review',
  ],
  'Review & Defense Preparation': [
    'Address supervisor feedback',
    'Prepare defense presentation slides',
    'Conduct mock defense with peers',
    'Submit final corrected draft',
  ],
  'Finalization & Submission': [
    'Final proofreading and formatting',
    'Submit for peer review',
    'Incorporate peer review comments',
    'Final submission and repository upload',
  ],
};

/**
 * Generate an AI-planned milestone schedule for a project.
 * Each month gets 1–2 milestones distributed across research phases.
 */
export function generateProjectMilestones(input: PlannerInput): GeneratedMilestone[] {
  const { projectId, startDate, durationMonths } = input;
  const start = parseISO(startDate);
  const milestones: GeneratedMilestone[] = [];
  const phaseUsage: Record<string, number> = {};

  for (let month = 1; month <= durationMonths; month++) {
    const phase = getPhaseForMonth(month, durationMonths);
    const available = PHASE_MILESTONES[phase] ?? [];
    const usedCount = phaseUsage[phase] ?? 0;

    // Pick up to 2 milestones per month from the current phase
    const milestonesThisMonth = month === durationMonths ? 2 : 1;
    for (let i = 0; i < milestonesThisMonth; i++) {
      const taskIndex = usedCount + i;
      if (taskIndex >= available.length) break;

      const weekOffset = i === 0 ? 1 : 3;
      const dueDate = addWeeks(addMonths(start, month - 1), weekOffset);

      milestones.push({
        project_id: projectId,
        title: available[taskIndex],
        description: `Month ${month} — ${phase}`,
        phase,
        month_number: month,
        week_number: weekOffset,
        due_date: format(dueDate, 'yyyy-MM-dd'),
        status: 'pending',
        is_ai_generated: true,
      });
    }

    phaseUsage[phase] = (phaseUsage[phase] ?? 0) + milestonesThisMonth;
  }

  return milestones;
}

/**
 * Build a Gantt-style phase distribution for display.
 * Returns one row per phase with start/end month.
 */
export function buildGanttPhases(durationMonths: number): Array<{
  phase: string;
  startMonth: number;
  endMonth: number;
  color: string;
}> {
  const colors = [
    '#0B5ED7', '#198754', '#FFC107', '#0dcaf0',
    '#6f42c1', '#d63384', '#fd7e14', '#20c997',
  ];
  const phaseCount = RESEARCH_PHASES.length;
  return RESEARCH_PHASES.map((p, i) => {
    const startMonth = Math.round((i / phaseCount) * durationMonths) + 1;
    const endMonth = Math.round(((i + 1) / phaseCount) * durationMonths);
    return {
      phase: p.label,
      startMonth: Math.max(1, startMonth),
      endMonth: Math.min(durationMonths, endMonth),
      color: colors[i % colors.length],
    };
  });
}
