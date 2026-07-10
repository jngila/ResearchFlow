import { supabase } from './supabase';
import { PRICING_DEFAULTS, PRICING_KEYS } from './constants';

export interface PricingConfig {
  pricePerStudentUsd: number;
  annualBaseFeeUsd: number;
  trialPeriodDays: number;
  billingCycle: 'annual' | 'monthly';
  currency: string;
  minStudents: number;
}

/** Load live pricing from the platform_settings table, fall back to code defaults. */
export async function loadPricingConfig(): Promise<PricingConfig> {
  const { data, error } = await supabase
    .from('platform_settings')
    .select('key, value')
    .eq('category', 'pricing');

  if (error || !data?.length) return { ...PRICING_DEFAULTS };

  const map = Object.fromEntries(data.map(r => [r.key, r.value]));

  return {
    pricePerStudentUsd: parseFloat(map[PRICING_KEYS.pricePerStudent] ?? String(PRICING_DEFAULTS.pricePerStudentUsd)),
    annualBaseFeeUsd:   parseFloat(map[PRICING_KEYS.annualBaseFee]   ?? String(PRICING_DEFAULTS.annualBaseFeeUsd)),
    trialPeriodDays:    parseInt(  map[PRICING_KEYS.trialPeriodDays]  ?? String(PRICING_DEFAULTS.trialPeriodDays), 10),
    billingCycle:      (map[PRICING_KEYS.billingCycle] as 'annual' | 'monthly') ?? PRICING_DEFAULTS.billingCycle,
    currency:           map[PRICING_KEYS.currency] ?? PRICING_DEFAULTS.currency,
    minStudents:        parseInt(  map[PRICING_KEYS.minStudents]      ?? String(PRICING_DEFAULTS.minStudents), 10),
  };
}

/** Calculate what an institution owes given its student count. */
export function calcAnnualBill(
  studentCount: number,
  config: Pick<PricingConfig, 'pricePerStudentUsd' | 'annualBaseFeeUsd' | 'minStudents'>
): { baseFee: number; studentFee: number; total: number; billableStudents: number } {
  const billableStudents = Math.max(studentCount, config.minStudents);
  const baseFee = config.annualBaseFeeUsd;
  const studentFee = billableStudents * config.pricePerStudentUsd;
  return { baseFee, studentFee, total: baseFee + studentFee, billableStudents };
}

/** Format a USD amount for display, e.g. 1050 → "$1,050" */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}
