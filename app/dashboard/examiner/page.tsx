'use client';

import DashboardShell from '@/components/layout/DashboardShell';
import StatCard from '@/components/dashboard/StatCard';
import { Award, Clock, CheckCircle, FileText, ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ASSIGNED_DEFENSES = [
  { id: 'd1', student: 'Alice Njoroge', title: 'Blockchain Credential Verification', type: 'Final Defense', date: 'Dec 10, 2024', time: '10:00 AM', venue: 'Room A204', status: 'scheduled' },
  { id: 'd2', student: 'Brian Otieno', title: 'Sustainable Agricultural Practices', type: 'Proposal Defense', date: 'Dec 15, 2024', time: '2:00 PM', venue: 'Senate Board Room', status: 'scheduled' },
  { id: 'd3', student: 'Carol Mwangi', title: 'NLP for Swahili Text Analysis', type: 'Final Defense', date: 'Nov 30, 2024', time: '9:00 AM', venue: 'Room B115', status: 'completed' },
];

export default function ExaminerDashboard() {
  return (
    <DashboardShell
      basePath="/dashboard/examiner"
      demoRole="examiner"
      breadcrumbs={[{ label: 'Dashboard' }]}
    >
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 rounded-2xl p-6 text-white mb-6">
        <h1 className="text-2xl font-bold mb-1">Dr. Peter Omondi</h1>
        <p className="text-amber-100 text-sm">Examiner &bull; Information Technology &bull; University of Technology</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Assigned Defenses" value={3} icon={Award} color="amber" />
        <StatCard label="Upcoming" value={2} icon={Clock} color="blue" />
        <StatCard label="Completed" value={1} icon={CheckCircle} color="green" />
        <StatCard label="Reports Pending" value={1} icon={FileText} color="red" delta="Submit soon" deltaType="negative" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Defenses list */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-800">Assigned Defenses</h2>
          {ASSIGNED_DEFENSES.map(d => (
            <div key={d.id} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <Badge className={cn(
                    'text-xs border-0 mb-2',
                    d.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  )}>
                    {d.status === 'completed' ? 'Completed' : 'Scheduled'}
                  </Badge>
                  <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2">{d.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{d.student}</p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">{d.type}</Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {d.date}
                </div>
                <span>{d.time}</span>
                <span>{d.venue}</span>
              </div>
              {d.status !== 'completed' && (
                <Button size="sm" variant="outline" className="mt-3 h-8 text-xs w-full">
                  View rubric & prepare
                </Button>
              )}
              {d.status === 'completed' && (
                <Button size="sm" className="mt-3 h-8 text-xs w-full bg-[#0B5ED7] hover:bg-[#0a52c4]">
                  Submit evaluation report
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Rubrics and guidelines */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-800">Evaluation Rubrics</h2>
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <div className="space-y-3">
              {[
                { title: 'Final Defense Rubric v2.1', updated: 'Oct 2024', criteria: 8 },
                { title: 'Proposal Defense Rubric v1.5', updated: 'Sep 2024', criteria: 6 },
                { title: 'Examiner Report Template', updated: 'Aug 2024', criteria: null },
              ].map((rubric, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{rubric.title}</p>
                    <p className="text-xs text-slate-400">Updated {rubric.updated}{rubric.criteria ? ` · ${rubric.criteria} criteria` : ''}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-8 text-xs text-[#0B5ED7] hover:bg-blue-50">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Past Evaluations</h3>
            <div className="space-y-3">
              {[
                { student: 'Carol Mwangi', outcome: 'Pass', score: 78, date: 'Nov 30' },
                { student: 'David Kimani', outcome: 'Minor Corrections', score: 65, date: 'Oct 15' },
                { student: 'Eva Wanjiku', outcome: 'Pass', score: 82, date: 'Sep 20' },
              ].map((eval_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-700">{eval_.student}</p>
                    <p className="text-xs text-slate-400">{eval_.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{eval_.score}%</span>
                    <Badge className={cn(
                      'text-xs border-0',
                      eval_.outcome === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    )}>
                      {eval_.outcome}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
