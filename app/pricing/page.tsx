'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle, Building2, GraduationCap, Users, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KES_PRICING } from '@/lib/constants';
import PublicNav from '@/components/layout/PublicNav';
import PublicFooter from '@/components/layout/PublicFooter';

const STUDENT_INCLUDES = [
  'Full research journey tracking',
  'Document upload & version control',
  'Supervisor communication hub',
  'AI Research Assistant access',
  'Meeting scheduler',
  'Deadline & stage notifications',
  'Payments dashboard',
  'Mobile-responsive interface',
];

const SUPERVISOR_INCLUDES = [
  'Supervisee portfolio dashboard',
  '3-year license validity',
  'Document review queue',
  'Inline feedback & annotation',
  'Progress analytics',
  'Meeting calendar',
  'Allocation request management',
  'Reports & exports',
];

const INSTITUTIONAL_INCLUDES = [
  'Everything in student & supervisor plans',
  'Full workflow engine configuration',
  'Multi-department support',
  'Defense & examination management',
  'Peer review module',
  'Institutional analytics dashboard',
  'Audit logs & compliance reports',
  'Custom branding & templates',
  'Priority support & SLA guarantee',
  'Dedicated account manager',
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-blue-500/20 text-blue-200 border-blue-400/30 hover:bg-blue-500/20">Pricing</Badge>
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
            Simple, transparent<br />
            <span className="text-blue-400">per-use pricing</span>
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            Students pay per project. Supervisors pay once. Institutions get everything on a custom annual plan.
          </p>
        </div>
      </section>

      {/* Individual pricing cards */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-blue-50 text-[#0B5ED7] border-blue-100 hover:bg-blue-50">Individual Plans</Badge>
            <h2 className="text-4xl font-bold text-slate-900">For students and supervisors</h2>
            <p className="text-lg text-slate-500 mt-3">No institution subscription required. Pay only for what you use.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student Project License */}
            <div className="bg-white rounded-2xl border-2 border-[#0B5ED7] shadow-xl shadow-blue-100 p-8 relative">
              <div className="absolute -top-4 left-8">
                <span className="bg-[#0B5ED7] text-white text-xs font-semibold px-4 py-1.5 rounded-full">Most popular</span>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-5">
                <GraduationCap className="w-6 h-6 text-[#0B5ED7]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Student Project License</h3>
              <p className="text-sm text-slate-500 mb-5">One-time per research project</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-slate-900">KES {KES_PRICING.studentProjectLicense.toLocaleString()}</span>
                <span className="text-slate-400 text-sm ml-2">/ project</span>
              </div>
              <ul className="space-y-3 mb-8">
                {STUDENT_INCLUDES.map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-[#198754] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register/student">
                <Button className="w-full bg-[#0B5ED7] hover:bg-[#0a52c4] h-11">
                  Register as a student
                </Button>
              </Link>
            </div>

            {/* Student Extension */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-5">
                <ArrowRight className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Project Extension</h3>
              <p className="text-sm text-slate-500 mb-5">Extend an existing project&apos;s timeline</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-slate-900">KES {KES_PRICING.studentExtension.toLocaleString()}</span>
                <span className="text-slate-400 text-sm ml-2">/ extension</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Extends project deadline',
                  'Continues full access',
                  'Supervisor notified automatically',
                  'Coordinator approval required',
                  'Audit trail maintained',
                  'Unlimited extension requests',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-[#198754] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth/login">
                <Button variant="outline" className="w-full h-11">
                  Request extension
                </Button>
              </Link>
            </div>

            {/* Supervisor License */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-5">
                <Users className="w-6 h-6 text-[#198754]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Supervisor License</h3>
              <p className="text-sm text-slate-500 mb-5">3-year access to supervisor portal</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-slate-900">KES {KES_PRICING.supervisorLicense.toLocaleString()}</span>
                <span className="text-slate-400 text-sm ml-2">/ {KES_PRICING.supervisorLicenseYears} years</span>
              </div>
              <ul className="space-y-3 mb-8">
                {SUPERVISOR_INCLUDES.map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-[#198754] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register">
                <Button variant="outline" className="w-full h-11">
                  Register as supervisor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional plan */}
      <section id="institutional" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-green-50 text-[#198754] border-green-100 hover:bg-green-50">For Institutions</Badge>
            <h2 className="text-4xl font-bold text-slate-900">Institutional plan</h2>
            <p className="text-lg text-slate-500 mt-3">Everything your university, college or research organisation needs.</p>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-10 text-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div>
                <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                  <Building2 className="w-7 h-7 text-blue-300" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Enterprise Research Platform</h3>
                <p className="text-slate-300 leading-relaxed mb-6">
                  A fully managed, white-label research management platform for your institution. Annual pricing based on enrolled student count — unlimited staff users always included.
                </p>
                <div className="bg-white/10 rounded-xl p-5 mb-6">
                  <p className="text-sm text-slate-300 mb-2">Pricing formula</p>
                  <p className="text-lg font-semibold text-white">Base fee + (enrolled students × per-student rate)</p>
                  <p className="text-sm text-slate-400 mt-1">Billed annually. Custom rate for large institutions.</p>
                </div>
                <Link href="/contact">
                  <Button size="lg" className="bg-[#0B5ED7] hover:bg-[#0a52c4] h-12 px-8 gap-2">
                    Contact sales <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-4">Everything included</p>
                <ul className="space-y-3">
                  {INSTITUTIONAL_INCLUDES.map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-200">
                      <CheckCircle className="w-4 h-4 text-[#198754] shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ-lite */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-50">Pricing FAQ</Badge>
            <h2 className="text-3xl font-bold text-slate-900">Common questions</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: 'Can a student use ResearchFlow without an institutional subscription?', a: 'Yes. Students can register independently and pay the per-project license fee. They will be asked to specify their institution, which can be registered later.' },
              { q: 'Does a supervisor license cover multiple institutions?', a: 'Yes. A supervisor license is tied to the person, not an institution. You can supervise students at any institution that uses ResearchFlow.' },
              { q: 'How is the institutional student count determined?', a: 'The enrolled student count is based on active research project registrations in the current academic year, not total institutional enrollment.' },
              { q: 'What payment methods are accepted?', a: 'We accept M-Pesa, debit/credit cards, and bank transfer. Institutional invoices are issued annually with 30-day payment terms.' },
            ].map(item => (
              <div key={item.q} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <div className="flex gap-3">
                  <HelpCircle className="w-5 h-5 text-[#0B5ED7] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-800 mb-2">{item.q}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/faq">
              <Button variant="outline" className="gap-2">View all FAQs <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[#0B5ED7] to-[#0a52c4]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-xl text-blue-100 mb-8">No credit card needed. Set up in minutes.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register/student">
              <Button size="lg" className="bg-white text-[#0B5ED7] hover:bg-blue-50 h-12 px-8 gap-2">
                Student registration <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent h-12 px-8">
                Talk to sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
