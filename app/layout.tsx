import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'sonner';
import BrowserExtensionErrorFilter from '@/components/BrowserExtensionErrorFilter';

export const metadata: Metadata = {
  title: 'ResearchFlow — Complete Research Lifecycle Management',
  description:
    'ResearchFlow digitizes and automates the entire academic research lifecycle for universities and research institutions worldwide.',
  openGraph: {
    title: 'ResearchFlow',
    description: 'Complete Research Lifecycle Management Platform',
    images: [{ url: 'https://bolt.new/static/og_default.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [{ url: 'https://bolt.new/static/og_default.png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Must run synchronously before any other scripts — filters errors thrown by
            browser extensions (MetaMask etc.) so they never reach the Next.js overlay. */}
        <script dangerouslySetInnerHTML={{ __html: `
(function() {
  var _onerror = window.onerror;
  window.onerror = function(msg, src) {
    if (typeof src === 'string' && (
      src.indexOf('chrome-extension://') === 0 ||
      src.indexOf('moz-extension://') === 0 ||
      src.indexOf('safari-extension://') === 0
    )) return true;
    if (typeof msg === 'string' && (
      msg.indexOf('MetaMask') !== -1 ||
      msg.indexOf('ethereum') !== -1
    )) return true;
    return _onerror ? _onerror.apply(this, arguments) : false;
  };
  window.addEventListener('unhandledrejection', function(e) {
    var msg = e.reason instanceof Error ? e.reason.message : String(e.reason || '');
    if (msg.indexOf('MetaMask') !== -1 || msg.indexOf('ethereum') !== -1) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);
  window.addEventListener('error', function(e) {
    var src = e.filename || '';
    if (src.indexOf('chrome-extension://') === 0 ||
        src.indexOf('moz-extension://') === 0 ||
        src.indexOf('safari-extension://') === 0) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);
})();
        ` }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-foreground antialiased" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <AuthProvider>
          <BrowserExtensionErrorFilter />
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
