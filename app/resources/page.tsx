'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, FileText, Video, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PublicNav from '@/components/layout/PublicNav';
import PublicFooter from '@/components/layout/PublicFooter';

const GUIDES = [
  {
    category: 'Getting Started',
    color: 'bg-blue-50 text-[#0B5ED7]',
    items: [
      { title: 'Student Quick Start Guide', desc: 'Register, set up your profile, and create your first research project in 10 minutes.', time: '10 min read' },
      { title: 'Supervisor Onboarding', desc: 'Accept your license, configure your profile, and start receiving student allocation requests.', time: '8 min read' },
      { title: 'Institution Setup Guide', desc: 'Register your institution, configure departments, and invite your first batch of users.', time: '20 min read' },
    ],
  },
  {
    category: 'Research Process',
    color: 'bg-green-50 text-[#198754]',
    items: [
      { title: 'Writing a Concept Paper', desc: 'Step-by-step guide to crafting a compelling concept paper that gets approved first time.', time: '15 min read' },
      { title: 'Proposal Development Best Practices', desc: 'Structure, content, and formatting guidance for undergraduate, masters, and PhD proposals.', time: '20 min read' },
      { title: 'Preparing for Your Defense', desc: 'How to prepare slides, anticipate examiner questions, and manage pre-defense nerves.', time: '12 min read' },
      { title: 'Data Collection Ethics & Compliance', desc: 'Ethical clearance, consent forms, and data handling requirements for academic research.', time: '10 min read' },
    ],
  },
  {
    category: 'Platform How-To',
    color: 'bg-amber-50 text-amber-700',
    items: [
      { title: 'Using the AI Research Assistant', desc: 'How to get the most out of the AI assistant for topic generation, proposal structuring, and writing.', time: '8 min read' },
      { title: 'Document Management & Versioning', desc: 'Upload, organize, and submit documents to your supervisor with full version history.', time: '6 min read' },
      { title: 'Setting Up Workflow Rules', desc: 'Configure stages, approval chains, deadlines, and escalation rules for your institution.', time: '15 min read' },
    ],
  },
];

const VIDEOS = [
  { title: 'Platform Overview (5 min)', desc: 'A quick tour of the ResearchFlow platform for new users.', duration: '5:22' },
  { title: 'Student Portal Walkthrough', desc: 'Full walkthrough of the student dashboard, projects, and documents.', duration: '12:45' },
  { title: 'Supervisor Dashboard Tour', desc: 'How supervisors manage their supervisee portfolio and review documents.', duration: '9:18' },
  { title: 'Institutional Admin Setup', desc: 'How to configure departments, workflows, and users for your institution.', duration: '18:00' },
];

const DOWNLOADS = [
  { title: 'Concept Paper Template', format: 'DOCX', desc: 'Standard template aligned with ResearchFlow workflow requirements.' },
  { title: 'Research Proposal Template', format: 'DOCX', desc: 'Structured template for undergraduate, masters, and PhD proposals.' },
  { title: 'Defense Rubric Sample', format: 'PDF', desc: 'Sample evaluation rubric used for proposal and final defense panels.' },
  { title: 'Student Onboarding Checklist', format: 'PDF', desc: 'Printable checklist for new students starting their research journey.' },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-blue-500/20 text-blue-200 border-blue-400/30 hover:bg-blue-500/20">Resources</Badge>
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
            Everything you need<br />
            <span className="text-blue-400">to succeed in research</span>
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            Guides, video tutorials, templates, and documentation to help you get the most out of ResearchFlow and your academic research journey.
          </p>
        </div>
      </section>

      {/* Guides */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-12">
            <BookOpen className="w-6 h-6 text-[#0B5ED7]" />
            <h2 className="text-3xl font-bold text-slate-900">Guides & Articles</h2>
          </div>
          <div className="space-y-12">
            {GUIDES.map(section => (
              <div key={section.category}>
                <Badge className={`mb-5 border-0 ${section.color.replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                  {section.category}
                </Badge>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.items.map(item => (
                    <div key={item.title} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-semibold text-slate-800 group-hover:text-[#0B5ED7] transition-colors leading-snug">{item.title}</h3>
                        <ExternalLink className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed mb-4">{item.desc}</p>
                      <span className="text-xs text-slate-400">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Videos */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-12">
            <Video className="w-6 h-6 text-[#0B5ED7]" />
            <h2 className="text-3xl font-bold text-slate-900">Video Tutorials</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VIDEOS.map(v => (
              <div key={v.title} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-[#0B5ED7]/80 transition-colors">
                    <Video className="w-6 h-6 text-white ml-0.5" />
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="text-xs bg-blue-50 text-[#0B5ED7] border-0">{v.duration}</Badge>
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm mb-1 group-hover:text-[#0B5ED7] transition-colors">{v.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Downloads */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-12">
            <Download className="w-6 h-6 text-[#0B5ED7]" />
            <h2 className="text-3xl font-bold text-slate-900">Templates & Downloads</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DOWNLOADS.map(d => (
              <div key={d.title} className="flex items-center gap-4 bg-slate-50 rounded-xl p-5 border border-slate-100 hover:shadow-sm transition-shadow cursor-pointer group">
                <div className="w-12 h-12 bg-[#0B5ED7]/10 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-[#0B5ED7]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-slate-800 text-sm group-hover:text-[#0B5ED7] transition-colors">{d.title}</p>
                    <Badge className="text-xs bg-slate-200 text-slate-600 border-0 h-5 px-1.5">{d.format}</Badge>
                  </div>
                  <p className="text-xs text-slate-400">{d.desc}</p>
                </div>
                <Download className="w-4 h-4 text-slate-300 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[#0B5ED7] to-[#0a52c4]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Still have questions?</h2>
          <p className="text-xl text-blue-100 mb-8">Check our FAQ or reach out — we are happy to help.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/faq">
              <Button size="lg" className="bg-white text-[#0B5ED7] hover:bg-blue-50 h-12 px-8 gap-2">
                Browse FAQ <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent h-12 px-8">
                Contact support
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
