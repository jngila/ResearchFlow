'use client';

import { useState } from 'react';
import { AlertTriangle, RefreshCw, Lock, Eye, FileText, Download, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatKes } from '@/lib/project-utils';
import { KES_PRICING } from '@/lib/constants';
import PaymentModal from '@/components/payments/PaymentModal';
import { PaymentMethod } from '@/types';
import { toast } from 'sonner';

interface ExpiredProjectBannerProps {
  projectTitle: string;
  extensionCount: number;
  onExtended?: () => void;
}

export default function ExpiredProjectBanner({
  projectTitle,
  extensionCount,
  onExtended,
}: ExpiredProjectBannerProps) {
  const [paymentOpen, setPaymentOpen] = useState(false);

  function handleExtensionSuccess(method: PaymentMethod, ref: string) {
    setPaymentOpen(false);
    toast.success('Extension activated! Your project is now reactivated for 6 months.');
    onExtended?.();
  }

  return (
    <>
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-red-800 text-base">Project License Expired</h3>
            <p className="text-sm text-red-700 mt-1 leading-relaxed">
              Your project license for <strong>&ldquo;{projectTitle}&rdquo;</strong> has expired.
              You are in <strong>read-only mode</strong>. To resume full access, purchase a 6-month extension.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
              {[
                { icon: Eye, label: 'View project', allowed: true },
                { icon: FileText, label: 'View documents', allowed: true },
                { icon: Download, label: 'Download files', allowed: true },
                { icon: MessageSquare, label: 'View comments', allowed: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 text-xs text-green-700">
                  <item.icon className="w-3.5 h-3.5 text-green-600" />
                  {item.label}
                </div>
              ))}
              {[
                'Upload files',
                'Edit documents',
                'Submit work',
                'Use AI features',
                'Create milestones',
                'Send messages',
              ].map(label => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-red-600">
                  <Lock className="w-3.5 h-3.5" />
                  {label}
                </div>
              ))}
            </div>
          </div>
          <div className="shrink-0">
            <Button
              className="bg-[#198754] hover:bg-[#157347] gap-2"
              onClick={() => setPaymentOpen(true)}
            >
              <RefreshCw className="w-4 h-4" />
              Extend — {formatKes(KES_PRICING.studentExtension)}
            </Button>
            <p className="text-xs text-slate-500 mt-1.5 text-center">+6 months &bull; Extension #{extensionCount + 1}</p>
          </div>
        </div>
      </div>

      <PaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        title="Project Extension License"
        description="Extends your project by 6 months and restores full access immediately."
        amountKes={KES_PRICING.studentExtension}
        onSuccess={handleExtensionSuccess}
      />
    </>
  );
}
