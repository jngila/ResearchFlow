'use client';

import Link from 'next/link';
import {
  ArrowRight, GitBranch, Users, FileText, BarChart3, Bell, Shield,
  BookOpen, MessageSquare, GraduationCap, Building2, Award, ClipboardList,
  Calendar, Zap, CheckCircle, Brain, FileSearch, UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PublicNav from '@/components/layout/PublicNav';
import PublicFooter from '@/components/layout/PublicFooter';

const STUDENT_FEATURES = [
  { icon: GitBranch, title: 'Research Journey Map', desc: 'Visual step-by-step progress tracker showing exactly where you are in the research lifecycle and what comes next.' },
  { icon: FileText, title: 'Document Management', desc: 'Upload, version, and share proposals, reports, presentations with your supervisor — all in one organized space.' },
  { icon: MessageSquare, title: 'Supervisor Communication', desc: 'Threaded project discussions, feedback threads, and file sharing with your supervisor and co-supervisor.' },
  { icon: Calendar, title: 'Meeting Scheduler', desc: 'Book supervision meetings, receive calendar invitations, and get automated reminders before deadlines.' },
  { icon: Bell, title: 'Deadline Alerts', desc: 'Never miss a stage deadline with smart notifications sent by email, SMS, and in-app as due dates approach.' },
  { icon: Brain, title: 'AI Research Assistant', desc: 'AI-powered assistant to help brainstorm topics, structure proposals, review literature, and draft sections.' },
];

const SUPERVISOR_FEATURES = [
  { icon: Users, title: 'Supervisee Dashboard', desc: 'View all your students in one dashboard with real-time stage progress, last activity, and upcoming deadlines.' },
  { icon: FileSearch, title: 'Document Review Queue', desc: 'Review, annotate, approve, or request revisions on student documents with a clear audit trail.' },
  { icon: UserCheck, title: 'Allocation Management', desc: 'Accept or decline supervisor allocation requests with a single click. Manage your maximum student load.' },
  { icon: MessageSquare, title: 'Feedback Threading', desc: 'Leave inline comments on documents, start discussion threads, and track resolution of feedback items.' },
  { icon: BarChart3, title: 'Progress Analytics', desc: 'View completion rates, stall points, and time-in-stage analytics across your entire supervisee portfolio.' },
  { icon: Calendar, title: 'Meeting Calendar', desc: 'Integrated scheduling with all your students. Set availability blocks and let students book open slots.' },
];

const UNIVERSITY_FEATURES = [
  { icon: GitBranch, title: 'Workflow Engine', desc: 'Configure custom research workflows — stages, approvals, timelines, and escalation rules — with a visual editor.' },
  { icon: Building2, title: 'Multi-Department Support', desc: 'Manage multiple faculties and departments each with their own coordinators, workflows, and branding.' },
  { icon: Award, title: 'Defense Management', desc: 'Schedule proposal and final defenses, assign examination panels, distribute rubrics, and collect outcomes.' },
  { icon: ClipboardList, title: 'Peer Review Module', desc: 'Facilitate blind peer review of research papers with structured forms, reviewer management, and outcome tracking.' },
  { icon: BarChart3, title: 'Institutional Analytics', desc: 'Real-time dashboards showing enrollment, completion rates, supervisor workloads, and stage distribution.' },
  { icon: Shield, title: 'Data Isolation', desc: 'Your institution\'s data is completely isolated from all other institutions. Zero cross-tenant data exposure.' },
];

const AI_FEATURES = [
  { title: 'Topic Generation', desc: 'Input your field of study and get 10 research topic ideas ranked by feasibility, novelty, and supervisor fit.' },
  { title: 'Proposal Structuring', desc: 'AI walks you through structuring a complete research proposal — introduction, objectives, methodology, and more.' },
  { title: 'Literature Review Aid', desc: 'Get summaries, identify research gaps, and build a structured review outline based on your topic.' },
  { title: 'Timeline Planning', desc: 'Generate a month-by-month research plan with milestones mapped to your project type and duration.' },
  { title: 'Writing Assistance', desc: 'Draft, revise, and improve sections of your proposal, report, or paper with AI writing guidance.' },
  { title: 'Grammar & Clarity', desc: 'Review your writing for clarity, academic tone, grammar, and structure before supervisor submission.' },
];

function FeatureCard({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow hover:-translate-y-0.5 transition-transform">
      <div className="w-10 h-10 bg-[#0B5ED7]/10 rounded-xl flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-[#0B5ED7]" />
      </div>
      <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-blue-500/20 text-blue-200 border-blue-400/30 hover:bg-blue-500/20">Platform Features</Badge>
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
            Everything your institution needs<br />
            <span className="text-blue-400">in one platform</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            ResearchFlow is purpose-built for academic research management. Here is a full breakdown of every feature available to students, supervisors, and administrators.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-[#0B5ED7] hover:bg-[#0a52c4] h-12 px-8 gap-2">
                Start free trial <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent h-12 px-8">
                View pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Student Features */}
      <section id="student" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-[#0B5ED7]" />
            </div>
            <div>
              <Badge className="mb-1 bg-blue-50 text-[#0B5ED7] border-blue-100 hover:bg-blue-50">Student Portal</Badge>
              <h2 className="text-3xl font-bold text-slate-900">Built for researchers at every level</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {STUDENT_FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section id="ai" className="py-20 bg-gradient-to-br from-slate-900 to-blue-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <Badge className="mb-1 bg-blue-500/20 text-blue-200 border-blue-400/30 hover:bg-blue-500/20">AI Assistant</Badge>
              <h2 className="text-3xl font-bold text-white">Your AI research co-pilot</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {AI_FEATURES.map(f => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supervisor Features */}
      <section id="supervisor" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-[#198754]" />
            </div>
            <div>
              <Badge className="mb-1 bg-green-50 text-[#198754] border-green-100 hover:bg-green-50">Supervisor Portal</Badge>
              <h2 className="text-3xl font-bold text-slate-900">Manage your supervisee portfolio with ease</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SUPERVISOR_FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* University Features */}
      <section id="university" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <Badge className="mb-1 bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-50">University Portal</Badge>
              <h2 className="text-3xl font-bold text-slate-900">Full institutional control and visibility</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {UNIVERSITY_FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-50 text-[#0B5ED7] border-blue-100 hover:bg-blue-50">Why ResearchFlow</Badge>
            <h2 className="text-4xl font-bold text-slate-900">ResearchFlow vs. manual processes</h2>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-100 px-6 py-4 text-sm font-semibold">
              <div className="text-slate-700">Feature</div>
              <div className="text-center text-[#0B5ED7]">ResearchFlow</div>
              <div className="text-center text-slate-400">Manual / Email</div>
            </div>
            {[
              ['Real-time project visibility', true, false],
              ['Automated deadline alerts', true, false],
              ['Document version control', true, false],
              ['Workflow automation', true, false],
              ['Structured supervisor feedback', true, false],
              ['Analytics & reporting', true, false],
              ['Peer review management', true, false],
              ['AI writing assistance', true, false],
            ].map(([label, rf, manual]) => (
              <div key={String(label)} className="grid grid-cols-3 px-6 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                <span className="text-sm text-slate-700">{String(label)}</span>
                <div className="flex justify-center">
                  {rf ? <CheckCircle className="w-5 h-5 text-[#198754]" /> : <span className="text-slate-300">—</span>}
                </div>
                <div className="flex justify-center">
                  {manual ? <CheckCircle className="w-5 h-5 text-[#198754]" /> : <span className="text-slate-300">—</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[#0B5ED7] to-[#0a52c4]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">See it in action</h2>
          <p className="text-xl text-blue-100 mb-8">Start a free trial or book a personalized demo with our team.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-[#0B5ED7] hover:bg-blue-50 h-12 px-8 gap-2">
                Start free trial <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent h-12 px-8">
                Book a demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
