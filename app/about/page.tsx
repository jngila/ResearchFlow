'use client';

import Link from 'next/link';
import { ArrowRight, Target, Heart, Zap, Globe2, Users, Award, Building2, GraduationCap, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PublicNav from '@/components/layout/PublicNav';
import PublicFooter from '@/components/layout/PublicFooter';

const TEAM = [
  { name: 'Dr. James Mwangi', role: 'CEO & Co-Founder', bg: 'JM', dept: 'Former Director of Research, University of Nairobi' },
  { name: 'Priya Sharma', role: 'CTO & Co-Founder', bg: 'PS', dept: 'Ex-Engineering Lead, African edtech unicorn' },
  { name: 'Prof. Amina Osei', role: 'Chief Academic Officer', bg: 'AO', dept: '20+ years in academic research administration' },
  { name: 'David Otieno', role: 'Head of Product', bg: 'DO', dept: 'Formerly product at Andela and Flutterwave' },
  { name: 'Fatima Al-Rashid', role: 'Head of Partnerships', bg: 'FA', dept: 'Built institutional networks across 12 countries' },
  { name: 'Samuel Kimani', role: 'Head of Engineering', bg: 'SK', dept: 'Full-stack engineer, open-source contributor' },
];

const VALUES = [
  { icon: Target, title: 'Impact First', desc: 'Every feature we build must measurably improve the research experience for students, supervisors, or administrators.' },
  { icon: Heart, title: 'Built for Africa', desc: 'We understand the unique pressures of African academia — limited budgets, overworked supervisors, and students who need clear guidance.' },
  { icon: Zap, title: 'Speed of Execution', desc: 'We ship, learn, and iterate. We believe in doing over deliberating, and feedback from real users guides our roadmap.' },
  { icon: Globe2, title: 'Global Standards', desc: 'While built for Africa, we meet global standards for security, data privacy, and research integrity expected worldwide.' },
];

const MILESTONES = [
  { year: '2021', title: 'The problem identified', desc: 'Our founders, frustrated with the chaos of manual research management at their institutions, began mapping the problem space.' },
  { year: '2022', title: 'First prototype', desc: 'Built and tested with 3 pilot institutions across Kenya and Uganda. 150 students onboarded in the first semester.' },
  { year: '2023', title: 'Series A funding', desc: 'Raised $2M seed round. Expanded to 25 institutions across East and West Africa. Team grew to 18 people.' },
  { year: '2024', title: 'Pan-African expansion', desc: '200+ institutions across 15 countries. 50,000 researchers on the platform. AI Research Assistant launched.' },
  { year: '2025', title: 'Global ambitions', desc: 'Expanding to Southeast Asia and South America. New enterprise tier launched for national research councils.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-blue-500/20 text-blue-200 border-blue-400/30 hover:bg-blue-500/20">Our Story</Badge>
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
            We exist to fix academic<br />
            <span className="text-blue-400">research administration</span>
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
            ResearchFlow was born out of a simple frustration: brilliant students losing months to administrative bottlenecks, supervisors drowning in paper trails, and coordinators working blind without real-time visibility.
          </p>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-blue-50 text-[#0B5ED7] border-blue-100 hover:bg-blue-50">Mission</Badge>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Accelerating research, one institution at a time</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                Our mission is to eliminate the administrative friction that slows down academic research across Africa and the world. We believe that when researchers and students can focus on ideas instead of paperwork, the quality and speed of human knowledge improves.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                By 2030, we aim to power the research workflows of 2,000 institutions, supporting over 500,000 researchers in completing their work on time, to standard, and with integrity.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: '200+', sub: 'Institutions trust us' },
                { label: '50K+', sub: 'Active researchers' },
                { label: '15', sub: 'Countries served' },
                { label: '98.5%', sub: 'Platform uptime' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
                  <div className="text-4xl font-bold text-[#0B5ED7] mb-1">{s.label}</div>
                  <div className="text-sm text-slate-500">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-green-50 text-[#198754] border-green-100 hover:bg-green-50">Our Values</Badge>
            <h2 className="text-4xl font-bold text-slate-900">What drives us every day</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(v => (
              <div key={v.title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-[#0B5ED7]/10 rounded-xl flex items-center justify-center mb-4">
                  <v.icon className="w-5 h-5 text-[#0B5ED7]" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{v.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-50">Our Journey</Badge>
            <h2 className="text-4xl font-bold text-slate-900">From idea to impact</h2>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-100" />
            <div className="space-y-8">
              {MILESTONES.map((m, i) => (
                <div key={m.year} className="flex gap-6 items-start">
                  <div className="w-16 h-16 bg-[#0B5ED7] text-white rounded-xl flex items-center justify-center font-bold text-sm shrink-0 z-10">
                    {m.year}
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex-1">
                    <h3 className="font-semibold text-slate-800 mb-1">{m.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-blue-50 text-[#0B5ED7] border-blue-100 hover:bg-blue-50">The Team</Badge>
            <h2 className="text-4xl font-bold text-slate-900">People behind the platform</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAM.map(member => (
              <div key={member.name} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#0B5ED7] rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {member.bg}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{member.name}</p>
                    <p className="text-sm text-[#0B5ED7]">{member.role}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{member.dept}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[#0B5ED7] to-[#0a52c4]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Join us in transforming research</h2>
          <p className="text-xl text-blue-100 mb-8">Whether you are a student, supervisor, or institution administrator — there is a home for you on ResearchFlow.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-[#0B5ED7] hover:bg-blue-50 h-12 px-8 gap-2">
                Get started free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent h-12 px-8">
                Contact us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
