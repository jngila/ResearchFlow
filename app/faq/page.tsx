'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import PublicNav from '@/components/layout/PublicNav';
import PublicFooter from '@/components/layout/PublicFooter';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const FAQS = [
  {
    category: 'Account & Registration',
    items: [
      { q: 'How do I register as a student?', a: 'Visit /auth/register/student, fill in your personal and academic details, choose your institution, and pay the per-project license fee. Your account is active immediately after payment.' },
      { q: 'Can I register without being affiliated to a specific institution?', a: 'Yes. During registration you can indicate that you are an independent researcher or specify your institution manually. An institution administrator can claim and link your account later.' },
      { q: 'How do supervisors get access?', a: 'Supervisors purchase a 3-year supervisor license and register via the supervisor registration page. They can then accept allocation requests from students and coordinators.' },
      { q: 'Can I have more than one role on ResearchFlow?', a: 'Not currently. Each account is tied to a single role. If you are both a student and a research assistant at a different institution, you would need separate accounts.' },
    ],
  },
  {
    category: 'Research Projects',
    items: [
      { q: 'How do I start a new research project?', a: 'After logging in as a student, go to My Projects and click "New Project". A setup wizard will guide you through selecting your project type, title, supervisor preferences, and duration.' },
      { q: 'What project types are supported?', a: 'ResearchFlow supports Undergraduate Projects (6 months), Master\'s Thesis (4–12 months), and PhD Dissertations (24 months). Each has a tailored workflow and document set.' },
      { q: 'Can I have multiple active projects?', a: 'Yes. You can have multiple projects running simultaneously, each with its own separate license. Each project is tracked independently with its own timeline and supervisor.' },
      { q: 'What happens when a project\'s deadline passes?', a: 'The system automatically flags the project as overdue and sends notifications to the student, supervisor, and coordinator. A project extension can be requested through the payments page.' },
    ],
  },
  {
    category: 'Supervision',
    items: [
      { q: 'How is a supervisor assigned to a student?', a: 'The research coordinator allocates supervisors based on available capacity and research topic fit. Students can indicate supervisor preferences during project creation.' },
      { q: 'Can a student have more than one supervisor?', a: 'Yes. ResearchFlow supports a primary supervisor and up to two co-supervisors. Each has their own access level and notification settings.' },
      { q: 'What can a supervisor see in ResearchFlow?', a: 'Supervisors can see all their supervisees\' project timelines, submitted documents, stage progress, and communication threads. They cannot see data from other supervisors\' students.' },
      { q: 'How does document review work?', a: 'Students submit documents to the supervisor. The supervisor receives a notification, reviews the document in-app, and can approve, request revisions, or reject with inline comments.' },
    ],
  },
  {
    category: 'Platform & Security',
    items: [
      { q: 'Is my research data secure?', a: 'All data is stored in encrypted PostgreSQL databases with row-level security policies. Documents are stored with Supabase Storage using signed URLs. No data is shared between institutions.' },
      { q: 'Does ResearchFlow work on mobile?', a: 'Yes. ResearchFlow is fully responsive and works on smartphones, tablets, and desktops. No app installation is required — it runs in any modern browser.' },
      { q: 'What is multi-tenancy and how does it protect my institution\'s data?', a: 'Multi-tenancy means each institution has a completely isolated environment — separate users, documents, workflows, and analytics. No institution can access another\'s data under any circumstance.' },
      { q: 'Is there an API for integration with existing university systems?', a: 'ResearchFlow provides a REST API for integration with student information systems, LDAP directories, and financial systems. Contact our team for API documentation and access.' },
    ],
  },
  {
    category: 'Billing & Payments',
    items: [
      { q: 'What payment methods are accepted?', a: 'We accept M-Pesa (Paybill), Visa/Mastercard debit and credit cards, and bank transfer. Institutional invoices are issued with 30-day net payment terms.' },
      { q: 'Can I get a refund on a student license?', a: 'Refunds are available within 7 days of purchase if no documents have been submitted through the system. Contact support at billing@researchflow.io for refund requests.' },
      { q: 'How is an institutional subscription billed?', a: 'Institutional subscriptions are billed annually based on the enrolled student count at the start of the academic year. An invoice is issued and payment is due within 30 days.' },
      { q: 'Is there a free trial for institutions?', a: 'Yes. Institutions can request a 30-day free trial that includes the full platform with up to 50 test accounts. Contact our sales team to set up your trial environment.' },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="font-medium text-slate-800 group-hover:text-[#0B5ED7] transition-colors pr-4 text-sm">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-[#0B5ED7] shrink-0" />
          : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        }
      </button>
      {open && (
        <div className="pb-4 text-slate-500 text-sm leading-relaxed">{a}</div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return FAQS;
    const q = query.toLowerCase();
    return FAQS
      .map(section => ({
        ...section,
        items: section.items.filter(item =>
          item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
        ),
      }))
      .filter(section => section.items.length > 0);
  }, [query]);

  const totalResults = filtered.reduce((acc, s) => acc + s.items.length, 0);

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-blue-500/20 text-blue-200 border-blue-400/30 hover:bg-blue-500/20">FAQ</Badge>
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
            Frequently asked<br />
            <span className="text-blue-400">questions</span>
          </h1>
          <p className="text-xl text-slate-300 mb-10 leading-relaxed">
            Answers to the most common questions from students, supervisors, and institutions.
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search questions..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="h-12 pl-12 bg-white text-slate-800 border-0 shadow-lg text-base"
            />
          </div>
          {query && (
            <p className="text-sm text-slate-400 mt-3">
              {totalResults} result{totalResults !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      </section>

      {/* FAQ content */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400 text-lg mb-4">No results found for &ldquo;{query}&rdquo;</p>
              <Link href="/contact">
                <Button variant="outline">Ask us directly</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-10">
              {filtered.map(section => (
                <div key={section.category}>
                  <Badge className="mb-4 bg-blue-50 text-[#0B5ED7] border-blue-100 hover:bg-blue-50">
                    {section.category}
                  </Badge>
                  <div className="bg-white border border-slate-100 rounded-2xl px-6 shadow-sm">
                    {section.items.map(item => (
                      <FAQItem key={item.q} q={item.q} a={item.a} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Still have questions */}
          <div className="mt-16 bg-slate-50 rounded-2xl p-8 border border-slate-100 text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Still have a question?</h3>
            <p className="text-slate-500 mb-5 text-sm">Our support team is available Monday–Friday 8am–6pm EAT.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/contact">
                <Button className="bg-[#0B5ED7] hover:bg-[#0a52c4]">Contact support</Button>
              </Link>
              <a href="mailto:support@researchflow.io">
                <Button variant="outline">support@researchflow.io</Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
