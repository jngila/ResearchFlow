'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { KES_PRICING, PAYMENT_METHOD_LABELS } from '@/lib/constants';
import Link from 'next/link';

interface Payment {
  id: string;
  user_id: string;
  payment_type: string;
  amount_kes: number;
  payment_method: string;
  payment_status: string;
  payment_reference: string | null;
  created_at: string;
}

const STATUS_CONFIG = {
  completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  pending: { color: 'bg-amber-100 text-amber-700', icon: Clock },
  failed: { color: 'bg-red-100 text-red-700', icon: AlertCircle },
  refunded: { color: 'bg-slate-100 text-slate-600', icon: ArrowRight },
};

const TYPE_LABELS: Record<string, string> = {
  student_project_license: 'Project License',
  student_project_extension: 'Project Extension',
  supervisor_license: 'Supervisor License',
  admin_seat: 'Admin Seat',
};

export default function PaymentsPage() {
  const { profile } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('payments')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setPayments(data as Payment[]);
        setLoading(false);
      });
  }, [profile]);

  const total = payments.filter(p => p.payment_status === 'completed').reduce((acc, p) => acc + p.amount_kes, 0);

  return (
    <DashboardShell
      basePath="/dashboard/student"
      title="Payments"
      breadcrumbs={[{ label: 'Student', href: '/dashboard/student' }, { label: 'Payments' }]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
            <p className="text-2xl font-bold text-slate-900">KES {total.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Project License</p>
            <p className="text-2xl font-bold text-[#0B5ED7]">KES {KES_PRICING.studentProjectLicense.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Extension Fee</p>
            <p className="text-2xl font-bold text-amber-600">KES {KES_PRICING.studentExtension.toLocaleString()}</p>
          </div>
        </div>

        {/* Payment history */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Payment History</h3>
            <Button size="sm" className="bg-[#0B5ED7] hover:bg-[#0a52c4] gap-1.5 text-xs" disabled>
              <CreditCard className="w-3.5 h-3.5" /> Pay now
            </Button>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-16">
              <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No payment records found.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {payments.map(p => {
                const config = STATUS_CONFIG[p.payment_status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
                const Icon = config.icon;
                return (
                  <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50">
                    <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm">{TYPE_LABELS[p.payment_type] ?? p.payment_type}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                        <span>{format(new Date(p.created_at), 'MMM d, yyyy')}</span>
                        {p.payment_method && (
                          <>
                            <span className="text-slate-200">·</span>
                            <span>{PAYMENT_METHOD_LABELS[p.payment_method as keyof typeof PAYMENT_METHOD_LABELS] ?? p.payment_method}</span>
                          </>
                        )}
                        {p.payment_reference && (
                          <>
                            <span className="text-slate-200">·</span>
                            <span className="font-mono">{p.payment_reference}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge className={cn('text-xs border-0 shrink-0', config.color)}>
                      {p.payment_status}
                    </Badge>
                    <p className="font-semibold text-slate-900 text-sm shrink-0">
                      KES {p.amount_kes.toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
