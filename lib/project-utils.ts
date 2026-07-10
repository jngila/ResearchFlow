import { addMonths, differenceInDays, differenceInCalendarDays, parseISO, format } from 'date-fns';
import { ProjectType, DeadlineStatus } from '@/types';
import { PROJECT_TYPE_DURATIONS } from './constants';

/**
 * Calculate project deadline from start date and duration.
 * - Undergraduate: fixed 6 months
 * - PhD: fixed 24 months
 * - Masters: uses selectedMonths
 */
export function calcProjectDeadline(
  startDate: Date | string,
  projectType: ProjectType,
  selectedMonths?: number
): Date {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const fixed = PROJECT_TYPE_DURATIONS[projectType];
  const months = fixed ?? selectedMonths ?? 6;
  return addMonths(start, months);
}

export function calcDaysRemaining(deadline: Date | string): number {
  const d = typeof deadline === 'string' ? parseISO(deadline) : deadline;
  return differenceInCalendarDays(d, new Date());
}

export function calcCompletionPercentage(
  startDate: Date | string,
  deadline: Date | string
): number {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof deadline === 'string' ? parseISO(deadline) : deadline;
  const totalDays = differenceInCalendarDays(end, start);
  if (totalDays <= 0) return 100;
  const elapsed = differenceInCalendarDays(new Date(), start);
  return Math.min(100, Math.max(0, Math.round((elapsed / totalDays) * 100)));
}

export function calcDeadlineStatus(
  daysRemaining: number,
  progressPercentage: number,
  timePercentageUsed: number
): DeadlineStatus {
  if (daysRemaining < 0) return 'overdue';
  const progressGap = timePercentageUsed - progressPercentage;
  if (progressGap > 20) return 'behind_schedule';
  if (progressGap < -10) return 'ahead_of_schedule';
  return 'on_track';
}

export function formatKes(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDeadlineDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMM yyyy');
}

/**
 * Generate a receipt number in format RF-YYYYMMDD-XXXX
 */
export function generateReceiptNumber(): string {
  const date = format(new Date(), 'yyyyMMdd');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RF-${date}-${rand}`;
}

/**
 * Returns true if the project deadline is within N days from now
 */
export function isWithinDays(deadline: string, days: number): boolean {
  const remaining = calcDaysRemaining(deadline);
  return remaining >= 0 && remaining <= days;
}

/** Deadline notification thresholds in days */
export const DEADLINE_NOTIFICATION_DAYS = [90, 60, 30, 14, 7, 3, 1, 0] as const;
