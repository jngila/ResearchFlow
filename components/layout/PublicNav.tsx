'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FlaskConical, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Resources', href: '/resources' },
  { label: 'About', href: '/about' },
];

export default function PublicNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
      scrolled ? 'bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm' : 'bg-transparent'
    )}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 bg-[#0B5ED7] rounded-lg flex items-center justify-center shadow-sm">
            <FlaskConical className="w-4 h-4 text-white" />
          </div>
          <span className={cn(
            'text-base font-bold transition-colors',
            scrolled || pathname !== '/' ? 'text-slate-900' : 'text-white'
          )}>
            ResearchFlow
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === l.href
                  ? 'text-[#0B5ED7] bg-blue-50'
                  : scrolled || pathname !== '/'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link href="/auth/login">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-9 px-4 text-sm font-medium',
                scrolled || pathname !== '/' ? 'text-slate-700 hover:text-slate-900' : 'text-white hover:bg-white/10'
              )}
            >
              Sign in
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button size="sm" className="h-9 px-4 bg-[#0B5ED7] hover:bg-[#0a52c4] text-white text-sm font-medium shadow-sm">
              Get started free
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open
            ? <X className={cn('w-5 h-5', scrolled || pathname !== '/' ? 'text-slate-700' : 'text-white')} />
            : <Menu className={cn('w-5 h-5', scrolled || pathname !== '/' ? 'text-slate-700' : 'text-white')} />
          }
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-b border-slate-100 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  pathname === l.href ? 'text-[#0B5ED7] bg-blue-50' : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Link href="/auth/login">
                <Button variant="outline" className="w-full h-10">Sign in</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="w-full h-10 bg-[#0B5ED7] hover:bg-[#0a52c4]">Get started free</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
