import Link from 'next/link';
import { FlaskConical, Twitter, Linkedin, Github, Mail, Phone, MapPin } from 'lucide-react';

const FOOTER_LINKS = {
  Platform: [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Resources', href: '/resources' },
    { label: 'About', href: '/about' },
  ],
  Students: [
    { label: 'Student Registration', href: '/auth/register/student' },
    { label: 'Research Journey', href: '/features#student' },
    { label: 'AI Assistant', href: '/features#ai' },
    { label: 'FAQ', href: '/faq' },
  ],
  Institutions: [
    { label: 'University Portal', href: '/features#university' },
    { label: 'Supervisor Portal', href: '/features#supervisor' },
    { label: 'Institutional Pricing', href: '/pricing#institutional' },
    { label: 'Contact Sales', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};

export default function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-[#0B5ED7] rounded-lg flex items-center justify-center">
                <FlaskConical className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold">ResearchFlow</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-5 max-w-xs">
              The complete research lifecycle management platform for universities, colleges, and research institutions.
            </p>
            <div className="space-y-2 text-sm text-slate-400">
              <a href="mailto:info@researchflow.io" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4 shrink-0" />
                info@researchflow.io
              </a>
              <a href="tel:+254700000000" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4 shrink-0" />
                +254 700 000 000
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                Nairobi, Kenya
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <p className="text-sm font-semibold text-white mb-4">{title}</p>
              <ul className="space-y-2.5">
                {links.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} ResearchFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" aria-label="Twitter" className="text-slate-400 hover:text-white transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" aria-label="LinkedIn" className="text-slate-400 hover:text-white transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="#" aria-label="GitHub" className="text-slate-400 hover:text-white transition-colors">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
