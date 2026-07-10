'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import StatCard from '@/components/dashboard/StatCard';
import { supabase } from '@/lib/supabase';
import { Institution } from '@/types';
import {
  Globe2, Users, Building2, DollarSign, ShieldCheck, ArrowRight,
  BarChart3, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const GROWTH_DATA = [
  { month: 'Jan', institutions: 150, students: 280 },
  { month: 'Feb', institutions: 162, students: 305 },
  { month: 'Mar', institutions: 170, students: 330 },
  { month: 'Apr', institutions: 178, students: 358 },
  { month: 'May', institutions: 183, students: 372 },
  { month: 'Jun', institutions: 190, students: 400 },
];

export default function SuperAdminDashboard() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [instRes, usersRes] = await Promise.all([
        supabase.from('institutions').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);
      if (instRes.data) setInstitutions(instRes.data as Institution[]);
      if (usersRes.count !== null) setTotalUsers(usersRes.count);
      setLoading(false);
    }
    load();
  }, []);

  const active = institutions.filter(i => i.subscription_status === 'active').length;
  const trial = institutions.filter(i => i.subscription_status === 'trial').length;

  return (
    <DashboardShell
      basePath="/dashboard/super-admin"
      demoRole="super_admin"
      breadcrumbs={[{ label: 'Platform Dashboard' }]}
    >
      <div className="bg-gradient-to-r from-[#0B5ED7] via-[#1e6fe8] to-[#0a52c4] rounded-2xl p-6 text-white mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-0 text-xs">Platform Super Admin</Badge>
            </div>
            <h1 className="text-2xl font-bold mb-1">ResearchFlow Control Center</h1>
            <p className="text-blue-200 text-sm">Global platform management &bull; All institutions</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/10 rounded-xl px-5 py-3 text-center">
              <p className="text-3xl font-bold">{loading ? '—' : institutions.length}</p>
              <p className="text-blue-100 text-xs">Institutions</p>
            </div>
            <div className="bg-white/10 rounded-xl px-5 py-3 text-center">
              <p className="text-3xl font-bold">{loading ? '—' : totalUsers.toLocaleString()}</p>
              <p className="text-blue-100 text-xs">Researchers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Institutions" value={loading ? '—' : institutions.length} icon={Globe2} color="blue" />
        <StatCard label="Active Users" value={loading ? '—' : totalUsers.toLocaleString()} icon={Users} color="green" />
        <StatCard label="Active Subs" value={loading ? '—' : active} icon={ShieldCheck} color="green" delta="Paid plans" deltaType="positive" />
        <StatCard label="On Trial" value={loading ? '—' : trial} icon={TrendingUp} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Platform Growth (simulated trend)</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={GROWTH_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Line type="monotone" dataKey="institutions" stroke="#0B5ED7" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="students" stroke="#198754" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Platform Controls</h3>
            <div className="space-y-2">
              {[
                { label: 'Manage Institutions', href: '/dashboard/super-admin/institutions', icon: Building2, color: 'text-[#0B5ED7]' },
                { label: 'Manage Universities', href: '/dashboard/super-admin/universities', icon: Globe2, color: 'text-[#198754]' },
                { label: 'Platform Settings', href: '/dashboard/super-admin/settings', icon: BarChart3, color: 'text-purple-600' },
                { label: 'Global Audit Log', href: '/dashboard/super-admin/audit', icon: ShieldCheck, color: 'text-amber-600' },
              ].map(action => (
                <Link key={action.label} href={action.href}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
                    <action.icon className={cn('w-4 h-4 shrink-0', action.color)} />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900">{action.label}</span>
                    <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-slate-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Subscription Breakdown</h3>
            {loading ? (
              <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-5 rounded" />)}</div>
            ) : (
              <div className="space-y-3">
                {(['active', 'trial', 'suspended', 'expired'] as const).map(status => {
                  const count = institutions.filter(i => i.subscription_status === status).length;
                  if (!count) return null;
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 capitalize">{status}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full',
                            status === 'active' ? 'bg-[#198754]' :
                            status === 'trial' ? 'bg-amber-500' :
                            status === 'suspended' ? 'bg-red-400' : 'bg-slate-300'
                          )}
                          style={{ width: `${(count / institutions.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Institutions table */}
      <div className="mt-6 bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate-50">
          <h2 className="text-sm font-semibold text-slate-800">Recent Institutions</h2>
          <Link href="/dashboard/super-admin/institutions">
            <Button variant="ghost" size="sm" className="text-[#0B5ED7] h-8 gap-1 text-xs">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-10 rounded" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-slate-400 border-b border-slate-50">
                  <th className="px-5 py-3">Institution</th>
                  <th className="px-5 py-3">Country</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Subscription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {institutions.slice(0, 10).map(inst => (
                  <tr key={inst.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ backgroundColor: inst.primary_color ?? '#0B5ED7' }}>
                          {inst.code.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{inst.name}</p>
                          <p className="text-xs text-slate-400">{inst.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs">{inst.country}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant="outline" className="text-xs capitalize">{inst.type.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge className={cn(
                        'text-xs border-0',
                        inst.subscription_status === 'active' ? 'bg-green-100 text-green-700' :
                        inst.subscription_status === 'trial' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      )}>
                        {inst.subscription_status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
