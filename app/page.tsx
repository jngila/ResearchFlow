'use client';

import Link from 'next/link';
import {
  ArrowRight, CheckCircle, Star, ChevronDown, ChevronUp,
  Users, FileText, GitBranch, Shield, BarChart3, Bell, BookOpen,
  GraduationCap, Building2, Globe2, Zap, Award, MessageSquare
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PRICING_DEFAULTS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import PublicNav from '@/components/layout/PublicNav';
import PublicFooter from '@/components/layout/PublicFooter';

const FEATURES = [
  {
    icon: GitBranch,
    title: 'Workflow Engine',
    desc: 'Automate every research stage from concept paper through publication with configurable, rule-based workflows.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Users,
    title: 'Multi-Role Access',
    desc: 'Tailored dashboards and permissions for students, supervisors, coordinators, examiners, and administrators.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: FileText,
    title: 'Document Management',
    desc: 'Secure version-controlled storage for proposals, reports, presentations, and official letters.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reporting',
    desc: 'Real-time dashboards with completion rates, supervisor workloads, delays, and institutional benchmarks.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    desc: 'Deadline reminders, escalation alerts, and in-app notifications keep everyone aligned and on schedule.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: Shield,
    title: 'Multi-Tenant Security',
    desc: 'Enterprise-grade data isolation ensures every institution&apos;s data remains completely separate and secure.',
    color: 'bg-slate-100 text-slate-600',
  },
  {
    icon: BookOpen,
    title: 'Repository & Publication',
    desc: 'Institutional repository, peer review management, and publication support in one unified platform.',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    icon: MessageSquare,
    title: 'Communication Hub',
    desc: 'Threaded project discussions, supervisor feedback, examiner comments — all in context.',
    color: 'bg-indigo-50 text-indigo-600',
  },
];

const WORKFLOW_STAGES = [
  { step: '01', label: 'Concept Paper', desc: 'Student submits concept for coordinator approval' },
  { step: '02', label: 'Supervisor Allocation', desc: 'Coordinator assigns primary and co-supervisor' },
  { step: '03', label: 'Proposal Development', desc: 'Student develops full research proposal' },
  { step: '04', label: 'Proposal Defense', desc: 'Panel examination with structured rubrics' },
  { step: '05', label: 'Data Collection', desc: 'Authorized data gathering phase begins' },
  { step: '06', label: 'Report Development', desc: 'Research report written with supervisor guidance' },
  { step: '07', label: 'Final Defense', desc: 'Comprehensive examination before panel' },
  { step: '08', label: 'Corrections & Review', desc: 'Peer review, corrections, and final approval' },
  { step: '09', label: 'Repository & Publication', desc: 'Deposit to institutional repository and publish' },
];

const TESTIMONIALS = [
  {
    quote: 'ResearchFlow transformed how we manage 800+ graduate students. What used to take weeks of emails now happens in hours.',
    name: 'Prof. Margaret Ochieng',
    title: 'Director of Graduate Studies',
    institution: 'University of Technology',
    avatar: 'MO',
  },
  {
    quote: 'The workflow engine is incredibly powerful. Every stage is tracked automatically and supervisors are always notified on time.',
    name: 'Dr. Samuel Karanja',
    title: 'Research Coordinator',
    institution: 'Nairobi Business College',
    avatar: 'SK',
  },
  {
    quote: 'As a student, I can see exactly where my project stands, what is needed next, and communicate with my supervisor in one place.',
    name: 'Amina Hassan',
    title: 'PhD Candidate',
    institution: 'East Africa Research Institute',
    avatar: 'AH',
  },
];

const FAQS = [
  {
    q: 'How does multi-tenancy work in ResearchFlow?',
    a: 'Each institution has a completely isolated data environment with separate users, workflows, templates, branding, and repositories. No data crosses between institutions at any point.',
  },
  {
    q: 'Can we customize workflows for our institution?',
    a: 'Yes. Institution administrators can configure custom stages, approval chains, timelines, rubrics, and document templates to match your institution\'s specific research policies.',
  },
  {
    q: 'Does ResearchFlow support different types of institutions?',
    a: 'ResearchFlow supports universities, colleges, TVET institutions, and standalone research organizations, each with their own program structures and workflow configurations.',
  },
  {
    q: 'How secure is our research data?',
    a: 'All data is stored in encrypted PostgreSQL databases with row-level security policies. Document storage uses Supabase Storage with signed URLs. We never share data between tenants.',
  },
  {
    q: 'What happens when a student\'s project stalls or misses a deadline?',
    a: 'The escalation engine automatically triggers notifications to supervisors and coordinators when deadlines are approaching or missed, ensuring no project falls through the cracks.',
  },
  {
    q: 'Is there a mobile-friendly experience?',
    a: 'ResearchFlow is fully responsive and works seamlessly on desktops, tablets, and smartphones — no native app installation required.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="font-medium text-slate-800 group-hover:text-[#0B5ED7] transition-colors pr-4">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-[#0B5ED7] shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
      </button>
      {open && (
        <div className="pb-5 text-slate-500 text-sm leading-relaxed animate-fade-in">{a}</div>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNav />

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden pt-32 pb-28 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute top-20 right-0 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 border border-blue-400/30 rounded-full text-sm text-blue-200 font-medium mb-6">
            <Zap className="w-3.5 h-3.5" />
            The complete research management platform for institutions
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">
            Research Lifecycle<br />
            <span className="text-blue-400">Managed End-to-End</span>
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
            ResearchFlow digitizes and automates the entire academic research journey — from concept paper submission through publication and institutional repository — for universities, colleges, and research organizations worldwide.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="bg-[#0B5ED7] hover:bg-[#0a52c4] h-12 px-8 text-base gap-2 shadow-lg shadow-blue-900/50">
                Start free trial
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-white/20 text-white hover:bg-white/10 bg-transparent">
                View live demo
              </Button>
            </Link>
          </div>

          <p className="mt-5 text-sm text-slate-400">
            No credit card required &bull; 30-day free trial &bull; Cancel anytime
          </p>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { value: '200+', label: 'Institutions' },
              { value: '50,000+', label: 'Researchers' },
              { value: '98.5%', label: 'Uptime SLA' },
              { value: '15+', label: 'Countries' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-50 text-[#0B5ED7] border-blue-100 hover:bg-blue-50">Platform Features</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything you need to manage research</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              A comprehensive suite of tools purpose-built for academic research management.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className={cn(
                  'bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5'
                )}
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', feature.color)}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WORKFLOW ===== */}
      <section id="workflow" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-50 text-[#198754] border-green-100 hover:bg-green-50">Research Lifecycle</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">The complete research journey</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Every stage is tracked, documented, and automatically progressed with your institution&apos;s rules.
            </p>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-100 via-[#0B5ED7]/30 to-green-100 mx-16" />

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-4">
              {WORKFLOW_STAGES.map((stage, i) => (
                <div key={stage.step} className="relative flex flex-col items-center text-center group">
                  <div className={cn(
                    'w-16 h-16 rounded-2xl flex items-center justify-center text-sm font-bold mb-3 border-2 transition-all group-hover:scale-110 shadow-sm',
                    i < 4 ? 'bg-[#0B5ED7] text-white border-[#0B5ED7]' :
                    i < 7 ? 'bg-[#198754] text-white border-[#198754]' :
                    'bg-amber-500 text-white border-amber-500'
                  )}>
                    {stage.step}
                  </div>
                  <p className="text-xs font-semibold text-slate-700 leading-tight">{stage.label}</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed hidden lg:block">{stage.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { color: 'bg-[#0B5ED7]', label: 'Pre-Research' },
              { color: 'bg-[#198754]', label: 'Active Research' },
              { color: 'bg-amber-500', label: 'Post-Research' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 justify-center text-sm text-slate-600">
                <div className={cn('w-3 h-3 rounded-full', item.color)} />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHO IS IT FOR ===== */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-white/10 text-white border-white/10 hover:bg-white/10">Built for everyone</Badge>
            <h2 className="text-4xl font-bold mb-4">Designed for every stakeholder</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Role-tailored dashboards and workflows for the entire research ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: GraduationCap, role: 'Students', desc: 'Track project progress, submit documents, communicate with supervisors, and meet deadlines.' },
              { icon: Users, role: 'Supervisors', desc: 'Manage your supervisee portfolio, provide feedback, approve documents, and monitor progress.' },
              { icon: BookOpen, role: 'Coordinators', desc: 'Oversee all research projects, schedule defenses, allocate supervisors, and generate reports.' },
              { icon: Award, role: 'Examiners', desc: 'Review assigned defenses, apply structured rubrics, and submit evaluation outcomes.' },
              { icon: MessageSquare, role: 'Peer Reviewers', desc: 'Conduct blind peer reviews with structured assessment forms and submission tracking.' },
              { icon: Building2, role: 'Administrators', desc: 'Configure institution settings, manage users, monitor analytics, and control workflows.' },
            ].map(item => (
              <div key={item.role} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                <item.icon className="w-8 h-8 text-[#FFC107] mb-4" />
                <h3 className="font-semibold text-lg mb-2">{item.role}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-50">Testimonials</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Trusted by researchers worldwide</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-slate-700 leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0B5ED7] rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.title} &bull; {t.institution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-blue-50 text-[#0B5ED7] border-blue-100 hover:bg-blue-50">Pricing</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Simple, usage-based pricing</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Pay only for your enrolled students. Supervisors, examiners, coordinators and peer reviewers are always included.
            </p>
          </div>

          {/* Main pricing card */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">

            {/* Formula card */}
            <div className="lg:col-span-3 bg-white rounded-2xl border-2 border-[#0B5ED7] shadow-xl shadow-blue-100 p-8 relative">
              <div className="absolute -top-4 left-8">
                <span className="bg-[#0B5ED7] text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                  How you are billed
                </span>
              </div>

              <div className="mt-2 space-y-5">
                {/* Base fee row */}
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-[#0B5ED7]/10 rounded-lg flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-[#0B5ED7]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="font-semibold text-slate-800">Annual Base Fee</p>
                      <p className="text-2xl font-bold text-slate-900">
                        ${PRICING_DEFAULTS.annualBaseFeeUsd}
                        <span className="text-sm font-normal text-slate-400">/year</span>
                      </p>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      Per institution. Covers <strong>unlimited</strong> supervisors, examiners, coordinators and peer reviewers.
                    </p>
                  </div>
                </div>

                {/* Plus separator */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-slate-400 text-sm font-medium">plus</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                {/* Per-student row */}
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-[#198754]/10 rounded-lg flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5 text-[#198754]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="font-semibold text-slate-800">Per-Student Fee</p>
                      <p className="text-2xl font-bold text-slate-900">
                        ${PRICING_DEFAULTS.pricePerStudentUsd}
                        <span className="text-sm font-normal text-slate-400">/student/year</span>
                      </p>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      Billed annually for each enrolled student. Scale up or down as enrollment changes.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href="/auth/register">
                    <Button className="w-full bg-[#0B5ED7] hover:bg-[#0a52c4] h-12 text-base">
                      Get started — no trial delay
                    </Button>
                  </Link>
                  <p className="text-center text-xs text-slate-400 mt-3">
                    No trial period &bull; Annual invoice &bull; Cancel anytime
                  </p>
                </div>
              </div>
            </div>

            {/* Example invoices */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Example annual invoices</h3>
              <div className="space-y-3">
                {[
                  { label: 'Small college', students: 50 },
                  { label: 'Mid-size university', students: 300 },
                  { label: 'Large university', students: 1000 },
                  { label: 'National institution', students: 5000 },
                ].map(({ label, students }) => {
                  const total = PRICING_DEFAULTS.annualBaseFeeUsd + students * PRICING_DEFAULTS.pricePerStudentUsd;
                  return (
                    <div key={label} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{label}</p>
                        <p className="text-xs text-slate-400">{students.toLocaleString()} students</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-slate-900">
                          ${total.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-400">per year</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800">
                <strong>Formula:</strong> $100 base + (students &times; $10) = annual total
              </div>
            </div>
          </div>

          {/* What's included */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 text-center">Everything included in every plan</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                'Full workflow engine',
                'Unlimited supervisors',
                'Unlimited examiners',
                'Document management',
                'Analytics & reports',
                'Institutional repository',
              ].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle className="w-4 h-4 text-[#198754] shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100">FAQ</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Frequently asked questions</h2>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl px-8 divide-y divide-slate-100">
            {FAQS.map(faq => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 bg-gradient-to-r from-[#0B5ED7] to-[#0a52c4]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Globe2 className="w-12 h-12 text-blue-200 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to transform research management at your institution?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join 200+ institutions across 15 countries that trust ResearchFlow to manage their entire research lifecycle.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-[#0B5ED7] hover:bg-blue-50 h-12 px-8 text-base gap-2 shadow-lg">
                Start your free trial
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-12 px-8 text-base">
                Explore the demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
