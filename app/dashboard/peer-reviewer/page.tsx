'use client';

import DashboardShell from '@/components/layout/DashboardShell';
import StatCard from '@/components/dashboard/StatCard';
import { ClipboardList, Clock, CheckCircle, FileText, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/lib/utils';

const PEER_REVIEWS = [
  {
    id: 'pr1',
    title: 'Machine Learning Approaches for Early Disease Detection in Resource-Limited Settings',
    student: 'Anonymous',
    program: 'PhD Computer Science',
    deadline: 'Dec 5, 2024',
    status: 'in_progress',
    progress: 60,
  },
  {
    id: 'pr2',
    title: 'Sustainable Agricultural Practices and Climate Resilience',
    student: 'Anonymous',
    program: 'PhD Environmental Studies',
    deadline: 'Dec 10, 2024',
    status: 'pending',
    progress: 0,
  },
  {
    id: 'pr3',
    title: 'Blockchain-Based Academic Credential Verification System',
    student: 'Anonymous',
    program: 'Masters IT',
    deadline: 'Nov 20, 2024',
    status: 'completed',
    progress: 100,
  },
];

export default function PeerReviewerDashboard() {
  return (
    <DashboardShell
      basePath="/dashboard/peer-reviewer"
      demoRole="peer_reviewer"
      breadcrumbs={[{ label: 'Dashboard' }]}
    >
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 rounded-2xl p-6 text-white mb-6">
        <h1 className="text-2xl font-bold mb-1">Dr. Rose Chebet</h1>
        <p className="text-teal-100 text-sm">Peer Reviewer &bull; Research & Innovation &bull; University of Technology</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Assigned Reviews" value={3} icon={ClipboardList} color="blue" />
        <StatCard label="In Progress" value={1} icon={Clock} color="amber" />
        <StatCard label="Completed" value={1} icon={CheckCircle} color="green" />
        <StatCard label="Pending Start" value={1} icon={FileText} color="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-slate-800">Assigned Reviews</h2>
          {PEER_REVIEWS.map(review => (
            <div key={review.id} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2">
                    {review.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{review.program}</p>
                </div>
                <Badge className={cn(
                  'text-xs border-0 shrink-0',
                  review.status === 'completed' ? 'bg-green-100 text-green-700' :
                  review.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-600'
                )}>
                  {review.status.replace('_', ' ')}
                </Badge>
              </div>

              {review.status !== 'completed' && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Review progress</span>
                    <span className="text-slate-700">{review.progress}%</span>
                  </div>
                  <ProgressBar value={review.progress} className="h-1.5" />
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">Deadline: {review.deadline}</p>
                {review.status !== 'completed' ? (
                  <Button size="sm" className="h-8 text-xs bg-[#0B5ED7] hover:bg-[#0a52c4]">
                    {review.status === 'in_progress' ? 'Continue review' : 'Start review'}
                  </Button>
                ) : (
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Submitted
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Review Guidelines</h3>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>All reviews are double-blind. Do not attempt to identify authors.</p>
              <p>Complete the structured assessment form for all criteria.</p>
              <p>Provide constructive, specific feedback for each criterion.</p>
              <p>Submit your review before the deadline to avoid escalation.</p>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4 h-8 text-xs">
              View full guidelines
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Performance Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Reviews completed</span>
                <span className="font-semibold text-slate-800">8</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">On-time rate</span>
                <span className="font-semibold text-green-600">92%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Avg. score given</span>
                <span className="font-semibold text-slate-800">71.4</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
