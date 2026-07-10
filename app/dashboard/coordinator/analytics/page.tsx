'use client';

import DashboardShell from '@/components/layout/DashboardShell';
import StatCard from '@/components/dashboard/StatCard';
import { BarChart3, TrendingUp, Users, Clock, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import StatCardComp from '@/components/dashboard/StatCard';

const MONTHLY_DATA = [
  { month: 'Jan', submitted: 8, approved: 6, rejected: 1 },
  { month: 'Feb', submitted: 12, approved: 9, rejected: 2 },
  { month: 'Mar', submitted: 10, approved: 8, rejected: 1 },
  { month: 'Apr', submitted: 15, approved: 11, rejected: 2 },
  { month: 'May', submitted: 9, approved: 7, rejected: 1 },
  { month: 'Jun', submitted: 14, approved: 12, rejected: 1 },
  { month: 'Jul', submitted: 11, approved: 9, rejected: 2 },
  { month: 'Aug', submitted: 16, approved: 13, rejected: 2 },
  { month: 'Sep', submitted: 13, approved: 10, rejected: 2 },
  { month: 'Oct', submitted: 18, approved: 14, rejected: 3 },
  { month: 'Nov', submitted: 12, approved: 9, rejected: 1 },
];

const STAGE_DIST = [
  { name: 'Concept Paper', value: 18, color: '#0B5ED7' },
  { name: 'Proposal', value: 24, color: '#1e6fe8' },
  { name: 'Data Collection', value: 15, color: '#198754' },
  { name: 'Report', value: 12, color: '#1da562' },
  { name: 'Final Defense', value: 6, color: '#FFC107' },
  { name: 'Completed', value: 22, color: '#198754' },
  { name: 'Peer Review', value: 5, color: '#6366f1' },
];

const COMPLETION_TREND = [
  { month: 'Jan', rate: 62 }, { month: 'Feb', rate: 65 }, { month: 'Mar', rate: 68 },
  { month: 'Apr', rate: 64 }, { month: 'May', rate: 70 }, { month: 'Jun', rate: 72 },
  { month: 'Jul', rate: 69 }, { month: 'Aug', rate: 74 }, { month: 'Sep', rate: 71 },
  { month: 'Oct', rate: 76 }, { month: 'Nov', rate: 78 },
];

export default function AnalyticsPage() {
  return (
    <DashboardShell
      basePath="/dashboard/coordinator"
      demoRole="coordinator"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard/coordinator' },
        { label: 'Analytics' },
      ]}
    >
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics & Reports</h1>
          <p className="text-slate-500 text-sm mt-1">Academic Year 2024/2025</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="2024">
            <SelectTrigger className="w-32 h-9 text-sm bg-white border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024/2025</SelectItem>
              <SelectItem value="2023">2023/2024</SelectItem>
              <SelectItem value="2022">2022/2023</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2 h-9">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCardComp label="Total Projects (YTD)" value={102} icon={BarChart3} color="blue" delta="+18% vs last year" deltaType="positive" />
        <StatCardComp label="Completion Rate" value="67%" icon={CheckCircle} color="green" delta="+5pp vs last year" deltaType="positive" />
        <StatCardComp label="Avg. Time to Defense" value="14 mo" icon={Clock} color="amber" delta="-1 month" deltaType="positive" />
        <StatCardComp label="Overdue Projects" value={6} icon={AlertTriangle} color="red" delta="Needs attention" deltaType="negative" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Monthly Submissions & Approvals</h2>
            <Badge className="bg-blue-50 text-[#0B5ED7] border-0 text-xs">2024</Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="submitted" name="Submitted" fill="#0B5ED7" radius={[3, 3, 0, 0]} />
              <Bar dataKey="approved" name="Approved" fill="#198754" radius={[3, 3, 0, 0]} />
              <Bar dataKey="rejected" name="Rejected" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Completion Rate Trend</h2>
            <Badge className="bg-green-50 text-[#198754] border-0 text-xs">YTD</Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={COMPLETION_TREND} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[50, 90]} />
              <Tooltip
                formatter={(v) => [`${v}%`, 'Completion Rate']}
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Line type="monotone" dataKey="rate" stroke="#0B5ED7" strokeWidth={2.5} dot={{ fill: '#0B5ED7', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Projects by Stage</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={STAGE_DIST} cx="50%" cy="50%" outerRadius={80} paddingAngle={2} dataKey="value">
                {STAGE_DIST.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {STAGE_DIST.slice(0, 4).map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-medium text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Supervisor workload table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-slate-50">
            <h2 className="text-sm font-semibold text-slate-800">Supervisor Workload Report</h2>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-medium text-slate-400 text-left border-b border-slate-50">
                  <th className="px-5 py-3">Supervisor</th>
                  <th className="px-5 py-3">Active</th>
                  <th className="px-5 py-3">Completed</th>
                  <th className="px-5 py-3">Overdue</th>
                  <th className="px-5 py-3">Capacity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { name: 'Dr. James Kamau', active: 5, completed: 12, overdue: 1, max: 8 },
                  { name: 'Prof. Mary Wanjiru', active: 3, completed: 8, overdue: 0, max: 6 },
                  { name: 'Dr. Peter Omondi', active: 7, completed: 15, overdue: 2, max: 8 },
                  { name: 'Dr. Rose Chebet', active: 2, completed: 6, overdue: 0, max: 5 },
                ].map(sup => (
                  <tr key={sup.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800 text-sm">{sup.name}</td>
                    <td className="px-5 py-3.5">
                      <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">{sup.active}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs">{sup.completed}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge className={`border-0 text-xs ${sup.overdue > 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                        {sup.overdue}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0B5ED7] rounded-full"
                            style={{ width: `${(sup.active / sup.max) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{sup.active}/{sup.max}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
