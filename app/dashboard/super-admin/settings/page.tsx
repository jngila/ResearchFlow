'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { supabase } from '@/lib/supabase';
import { PRICING_DEFAULTS, PRICING_KEYS } from '@/lib/constants';
import { calcAnnualBill, formatUsd, PricingConfig } from '@/lib/pricing';
import {
  DollarSign, Save, RefreshCw, AlertTriangle, Info,
  Calculator, Users, Building2, CheckCircle, UserCog
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SettingRow {
  key: string;
  value: string;
  label: string;
  description: string;
  category: string;
}

// Demo student counts for the live preview calculator
const PREVIEW_SIZES = [
  { label: 'Small college', students: 50 },
  { label: 'Mid-size university', students: 300 },
  { label: 'Large university', students: 1000 },
  { label: 'National institution', students: 5000 },
];

export default function PricingSettingsPage() {
  const [settings, setSettings] = useState<SettingRow[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('category', 'pricing')
      .order('key');

    if (error) {
      toast.error('Failed to load settings');
      // Fall back to defaults so the page is still usable
      const defaults: SettingRow[] = [
        { key: PRICING_KEYS.pricePerStudent, value: String(PRICING_DEFAULTS.pricePerStudentUsd), label: 'Per-Student Annual Fee (USD)', description: 'Annual fee per enrolled student.', category: 'pricing' },
        { key: PRICING_KEYS.annualBaseFee,   value: String(PRICING_DEFAULTS.annualBaseFeeUsd),   label: 'Annual Institution Base Fee (USD)', description: 'Covers all staff (supervisors, examiners, coordinators).', category: 'pricing' },
        { key: PRICING_KEYS.trialPeriodDays, value: String(PRICING_DEFAULTS.trialPeriodDays),  label: 'Trial Period (days)', description: 'Set to 0 to disable trials.', category: 'pricing' },
        { key: PRICING_KEYS.minStudents,     value: String(PRICING_DEFAULTS.minStudents),       label: 'Minimum Billable Students', description: 'Minimum seats billed even if fewer are enrolled.', category: 'pricing' },
      ];
      setSettings(defaults);
      setDraft(Object.fromEntries(defaults.map(s => [s.key, s.value])));
    } else {
      setSettings(data ?? []);
      setDraft(Object.fromEntries((data ?? []).map(s => [s.key, s.value])));
    }
    setLoading(false);
  }

  function handleChange(key: string, value: string) {
    setDraft(d => ({ ...d, [key]: value }));
    setIsDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    const updates = Object.entries(draft).map(([key, value]) =>
      supabase.from('platform_settings').update({ value, updated_at: new Date().toISOString() }).eq('key', key)
    );
    const results = await Promise.all(updates);
    const failed = results.filter(r => r.error);
    if (failed.length) {
      toast.error('Some settings failed to save. Please try again.');
    } else {
      toast.success('Pricing settings saved successfully.');
      setIsDirty(false);
      loadSettings();
    }
    setSaving(false);
  }

  function handleReset() {
    setDraft(Object.fromEntries(settings.map(s => [s.key, s.value])));
    setIsDirty(false);
  }

  // Live preview from current draft values
  const previewConfig = {
    pricePerStudentUsd: parseFloat(draft[PRICING_KEYS.pricePerStudent] ?? '10') || 0,
    annualBaseFeeUsd:   parseFloat(draft[PRICING_KEYS.annualBaseFee]   ?? '100') || 0,
    adminSeatPriceUsd:  parseFloat(draft[PRICING_KEYS.adminSeatPrice]  ?? '100') || 0,
    minStudents:        parseInt(draft[PRICING_KEYS.minStudents]        ?? '1', 10) || 1,
  };
  const trialDays   = parseInt(draft[PRICING_KEYS.trialPeriodDays] ?? '0', 10) || 0;
  const trialEnabled = trialDays > 0;

  const NUMERIC_KEYS = new Set<string>([
    PRICING_KEYS.pricePerStudent,
    PRICING_KEYS.annualBaseFee,
    PRICING_KEYS.adminSeatPrice,
    PRICING_KEYS.trialPeriodDays,
    PRICING_KEYS.minStudents,
  ]);
  const trialKey = PRICING_KEYS.trialPeriodDays as string;
  const minKey   = PRICING_KEYS.minStudents as string;

  return (
    <DashboardShell
      basePath="/dashboard/super-admin"
      demoRole="super_admin"
      breadcrumbs={[
        { label: 'Platform Dashboard', href: '/dashboard/super-admin' },
        { label: 'Settings' },
        { label: 'Pricing' },
      ]}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pricing Configuration</h1>
          <p className="text-slate-500 text-sm mt-1">
            Changes take effect immediately for all new invoices and institution sign-ups.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <Button variant="outline" size="sm" className="gap-2 h-9" onClick={handleReset}>
              <RefreshCw className="w-4 h-4" />
              Reset
            </Button>
          )}
          <Button
            size="sm"
            className="gap-2 h-9 bg-[#0B5ED7] hover:bg-[#0a52c4]"
            onClick={handleSave}
            disabled={saving || !isDirty}
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save changes
          </Button>
        </div>
      </div>

      {isDirty && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          You have unsaved changes. Click &ldquo;Save changes&rdquo; to apply them.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ─── Settings form ─── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Core fees */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#0B5ED7]" />
                <h2 className="text-sm font-semibold text-slate-800">Fee Structure</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Annual charges applied per institution.</p>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Per-student fee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                <div className="space-y-1.5">
                  <Label htmlFor={PRICING_KEYS.pricePerStudent} className="text-slate-700">
                    Per-Student Annual Fee (USD)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
                    <Input
                      id={PRICING_KEYS.pricePerStudent}
                      type="number"
                      min="0"
                      step="0.01"
                      value={draft[PRICING_KEYS.pricePerStudent] ?? '10'}
                      onChange={e => handleChange(PRICING_KEYS.pricePerStudent, e.target.value)}
                      className="pl-7 bg-slate-50 h-10"
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    Charged once per year for each enrolled student. The primary revenue driver.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm">
                  <p className="font-semibold text-blue-800 mb-1">Who is a &ldquo;student&rdquo;?</p>
                  <p className="text-blue-700 text-xs leading-relaxed">
                    Any user with the <strong>Student</strong> role in the institution. Supervisors, examiners, coordinators, and peer reviewers are covered by the base fee.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Annual base fee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                <div className="space-y-1.5">
                  <Label htmlFor={PRICING_KEYS.annualBaseFee} className="text-slate-700">
                    Annual Institution Base Fee (USD)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
                    <Input
                      id={PRICING_KEYS.annualBaseFee}
                      type="number"
                      min="0"
                      step="0.01"
                      value={draft[PRICING_KEYS.annualBaseFee] ?? '100'}
                      onChange={e => handleChange(PRICING_KEYS.annualBaseFee, e.target.value)}
                      className="pl-7 bg-slate-50 h-10"
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    Flat annual access fee per institution. Grants unlimited supervisor, examiner, coordinator and peer reviewer seats.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm">
                  <p className="font-semibold text-green-800 mb-1">What does the base fee cover?</p>
                  <ul className="text-green-700 text-xs leading-relaxed space-y-0.5">
                    <li>✓ Unlimited supervisors</li>
                    <li>✓ Unlimited examiners</li>
                    <li>✓ Unlimited coordinators</li>
                    <li>✓ Unlimited peer reviewers</li>
                    <li>✓ Full platform features</li>
                  </ul>
                </div>
              </div>

              <Separator />

              {/* Admin seat price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                <div className="space-y-1.5">
                  <Label htmlFor={PRICING_KEYS.adminSeatPrice} className="text-slate-700">
                    Admin Seat Price (USD)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
                    <Input
                      id={PRICING_KEYS.adminSeatPrice}
                      type="number"
                      min="0"
                      step="0.01"
                      value={draft[PRICING_KEYS.adminSeatPrice] ?? '100'}
                      onChange={e => handleChange(PRICING_KEYS.adminSeatPrice, e.target.value)}
                      className="pl-7 bg-slate-50 h-10"
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    One-time fee per admin seat. Each seat grants one Institution Administrator account. Universities may purchase multiple seats for different faculties.
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <UserCog className="w-4 h-4 text-amber-700" />
                    <p className="font-semibold text-amber-800">Admin seat model</p>
                  </div>
                  <ul className="text-amber-700 text-xs leading-relaxed space-y-0.5">
                    <li>&#x2713; Each faculty/school can have its own admin</li>
                    <li>&#x2713; Institution requests seats, super-admin approves</li>
                    <li>&#x2713; Seats activated only after payment confirmed</li>
                    <li>&#x2713; All users share one institution code</li>
                  </ul>
                </div>
              </div>

              <Separator />
              <div className="space-y-1.5 max-w-xs">
                <Label htmlFor={PRICING_KEYS.minStudents} className="text-slate-700">
                  Minimum Billable Students
                </Label>
                <Input
                  id={PRICING_KEYS.minStudents}
                  type="number"
                  min="1"
                  step="1"
                  value={draft[PRICING_KEYS.minStudents] ?? '1'}
                  onChange={e => handleChange(PRICING_KEYS.minStudents, e.target.value)}
                  className="bg-slate-50 h-10"
                />
                <p className="text-xs text-slate-400">
                  An institution is billed for at least this many student seats, even if fewer are enrolled. Minimum: 1.
                </p>
              </div>
            </div>
          </div>

          {/* Trial period */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-800">Trial Period</h2>
              </div>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div className="space-y-1.5 flex-1 min-w-[200px]">
                  <Label htmlFor={PRICING_KEYS.trialPeriodDays} className="text-slate-700">
                    Trial Period (days)
                  </Label>
                  <Input
                    id={PRICING_KEYS.trialPeriodDays}
                    type="number"
                    min="0"
                    step="1"
                    value={draft[PRICING_KEYS.trialPeriodDays] ?? '0'}
                    onChange={e => handleChange(PRICING_KEYS.trialPeriodDays, e.target.value)}
                    className="bg-slate-50 h-10 max-w-xs"
                  />
                  <p className="text-xs text-slate-400">
                    Days a new institution may use the platform before payment is required.{' '}
                    <strong>Set to 0 to require payment upfront (current setting).</strong>
                  </p>
                </div>

                <div className={cn(
                  'flex-shrink-0 rounded-xl border px-5 py-3 text-center min-w-[140px]',
                  trialEnabled
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-slate-50 border-slate-100'
                )}>
                  <div className={cn(
                    'text-2xl font-bold mb-1',
                    trialEnabled ? 'text-amber-700' : 'text-slate-400'
                  )}>
                    {trialEnabled ? `${trialDays}d` : 'Off'}
                  </div>
                  <p className={cn('text-xs', trialEnabled ? 'text-amber-600' : 'text-slate-400')}>
                    {trialEnabled ? 'Trial active' : 'No trial'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-3 px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600">
            <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <p>
              These values are stored in the database and take effect immediately upon saving — no code deployment needed.
              Historical invoices already issued are not retroactively changed.
              Contact your payment processor (Stripe) to synchronise price changes there as well.
            </p>
          </div>
        </div>

        {/* ─── Live calculator ─── */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#0B5ED7]" />
                <h2 className="text-sm font-semibold text-slate-800">Live Invoice Preview</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Updates as you type.</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              {PREVIEW_SIZES.map(({ label, students }) => {
                const bill = calcAnnualBill(students, previewConfig);
                return (
                  <div key={label} className="rounded-lg border border-slate-100 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-700">{label}</p>
                        <p className="text-xs text-slate-400">{students.toLocaleString()} students</p>
                      </div>
                      <p className="text-base font-bold text-slate-900">{formatUsd(bill.total)}<span className="text-xs font-normal text-slate-400">/yr</span></p>
                    </div>
                    <div className="space-y-1 text-xs text-slate-500">
                      <div className="flex justify-between">
                        <span>Base fee</span>
                        <span>{formatUsd(bill.baseFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{bill.billableStudents.toLocaleString()} × {formatUsd(previewConfig.pricePerStudentUsd)}</span>
                        <span>{formatUsd(bill.studentFee)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

            <div className="bg-gradient-to-br from-[#0B5ED7] to-[#0a52c4] rounded-xl p-5 text-white">
            <h3 className="text-sm font-semibold mb-3">Pricing Formula</h3>
            <div className="bg-white/10 rounded-lg p-3 font-mono text-xs text-blue-100 leading-relaxed">
              <p>Annual Bill =</p>
              <p className="ml-3">Base Fee ({formatUsd(previewConfig.annualBaseFeeUsd)})</p>
              <p className="ml-3">+ Students × {formatUsd(previewConfig.pricePerStudentUsd)}</p>
              <p className="mt-2 text-blue-200">Admin seats (one-time):</p>
              <p className="ml-3">{formatUsd(previewConfig.adminSeatPriceUsd)} / seat</p>
            </div>
            <p className="text-blue-200 text-xs mt-3">
              Supervisors, examiners, coordinators and peer reviewers are unlimited and included in the base fee. Admin seats are purchased separately per request.
            </p>
          </div>

          {/* Current effective values */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Current Saved Values</h3>
            {loading ? (
              <p className="text-xs text-slate-400">Loading…</p>
            ) : (
              <div className="space-y-2">
                {settings.map(s => (
                  <div key={s.key} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 truncate pr-2">{s.label}</span>
                    <Badge variant="outline" className="text-xs font-mono shrink-0">
                      {NUMERIC_KEYS.has(s.key) && s.key !== trialKey && s.key !== minKey
                        ? formatUsd(parseFloat(s.value))
                        : s.value}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
