'use client';

import { useState } from 'react';
import { Smartphone, CreditCard, Landmark, Loader2, CheckCircle2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { formatKes } from '@/lib/project-utils';
import { PaymentMethod } from '@/types';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  amountKes: number;
  onSuccess: (method: PaymentMethod, reference: string) => void;
}

const METHODS: { id: PaymentMethod; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'mpesa',         label: 'M-Pesa',        icon: Smartphone,  color: 'bg-green-50 border-green-200 text-green-800' },
  { id: 'debit_card',   label: 'Debit Card',    icon: CreditCard,  color: 'bg-blue-50 border-blue-200 text-blue-800' },
  { id: 'credit_card',  label: 'Credit Card',   icon: CreditCard,  color: 'bg-purple-50 border-purple-200 text-purple-800' },
  { id: 'bank_transfer',label: 'Bank Transfer', icon: Landmark,    color: 'bg-slate-50 border-slate-200 text-slate-800' },
];

type Step = 'method' | 'details' | 'processing' | 'success';

export default function PaymentModal({
  open, onOpenChange, title, description, amountKes, onSuccess,
}: PaymentModalProps) {
  const [step, setStep] = useState<Step>('method');
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [receiptRef, setReceiptRef] = useState('');

  function reset() {
    setStep('method');
    setMethod(null);
    setPhone('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setReceiptRef('');
  }

  function handleClose(open: boolean) {
    if (!open) reset();
    onOpenChange(open);
  }

  async function handlePay() {
    if (!method) return;
    setStep('processing');
    // Simulate payment processing (1.5s)
    await new Promise(r => setTimeout(r, 1500));
    const ref = `RF-${Date.now().toString(36).toUpperCase()}`;
    setReceiptRef(ref);
    setStep('success');
    onSuccess(method, ref);
  }

  const canProceed = method === 'mpesa'
    ? phone.length >= 10
    : method === 'bank_transfer'
    ? true
    : cardNumber.length === 19 && cardExpiry.length === 5 && cardCvv.length === 3;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Receipt className="w-5 h-5 text-[#0B5ED7]" />
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Amount banner */}
        <div className="bg-gradient-to-r from-[#0B5ED7] to-[#1e6fe8] rounded-xl p-4 text-white text-center">
          <p className="text-blue-100 text-xs mb-1">{description}</p>
          <p className="text-3xl font-bold">{formatKes(amountKes)}</p>
          <p className="text-blue-200 text-xs mt-0.5">One-time payment</p>
        </div>

        {/* ── Step: Select Method ── */}
        {step === 'method' && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Select payment method</p>
            <div className="grid grid-cols-2 gap-2">
              {METHODS.map(m => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium',
                      method === m.id
                        ? 'border-[#0B5ED7] bg-blue-50 text-[#0B5ED7]'
                        : 'border-slate-100 hover:border-slate-300 text-slate-600'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {m.label}
                  </button>
                );
              })}
            </div>
            <Button
              className="w-full bg-[#0B5ED7] hover:bg-[#0a52c4] h-11"
              disabled={!method}
              onClick={() => setStep('details')}
            >
              Continue
            </Button>
          </div>
        )}

        {/* ── Step: Payment Details ── */}
        {step === 'details' && method && (
          <div className="space-y-4">
            {method === 'mpesa' && (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-xs text-green-800">
                  Enter your M-Pesa registered phone number. You will receive an STK push prompt to confirm payment.
                </div>
                <div className="space-y-1.5">
                  <Label>M-Pesa Phone Number</Label>
                  <Input
                    placeholder="0712 345 678"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    className="bg-slate-50"
                  />
                </div>
              </div>
            )}

            {(method === 'debit_card' || method === 'credit_card') && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Card Number</Label>
                  <Input
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={e => {
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                      setCardNumber(raw.replace(/(.{4})/g, '$1 ').trim());
                    }}
                    className="bg-slate-50 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Expiry</Label>
                    <Input
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={e => {
                        let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                        if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
                        setCardExpiry(v);
                      }}
                      className="bg-slate-50 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>CVV</Label>
                    <Input
                      placeholder="123"
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      className="bg-slate-50 font-mono"
                      type="password"
                    />
                  </div>
                </div>
              </div>
            )}

            {method === 'bank_transfer' && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-sm">
                <p className="font-semibold text-slate-800">Bank Transfer Details</p>
                <div className="space-y-1 text-slate-600">
                  <div className="flex justify-between"><span>Bank:</span><span className="font-medium">Equity Bank Kenya</span></div>
                  <div className="flex justify-between"><span>Account:</span><span className="font-medium font-mono">1234567890</span></div>
                  <div className="flex justify-between"><span>Account Name:</span><span className="font-medium">ResearchFlow Ltd</span></div>
                  <div className="flex justify-between"><span>Reference:</span><span className="font-medium font-mono">{`RF-${Date.now().toString(36).toUpperCase().slice(0, 6)}`}</span></div>
                </div>
                <p className="text-xs text-slate-400 mt-2">Use the reference above when making the transfer. Your license will be activated within 1 business day after payment confirmation.</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep('method')}>
                Back
              </Button>
              <Button
                className="flex-1 bg-[#0B5ED7] hover:bg-[#0a52c4]"
                disabled={!canProceed}
                onClick={handlePay}
              >
                {method === 'bank_transfer' ? 'I have paid' : `Pay ${formatKes(amountKes)}`}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step: Processing ── */}
        {step === 'processing' && (
          <div className="flex flex-col items-center py-8 gap-4">
            <Loader2 className="w-10 h-10 text-[#0B5ED7] animate-spin" />
            <p className="text-sm font-medium text-slate-700">Processing your payment…</p>
            <p className="text-xs text-slate-400">Please do not close this window.</p>
          </div>
        )}

        {/* ── Step: Success ── */}
        {step === 'success' && (
          <div className="flex flex-col items-center py-6 gap-3 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[#198754]" />
            </div>
            <p className="text-lg font-bold text-slate-900">Payment Successful!</p>
            <p className="text-sm text-slate-500">Your license has been activated.</p>
            <div className="bg-slate-50 rounded-xl p-4 w-full text-left space-y-1.5 text-sm mt-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Amount paid</span>
                <span className="font-semibold">{formatKes(amountKes)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No.</span>
                <span className="font-mono font-medium">{receiptRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Method</span>
                <span className="capitalize">{method?.replace('_', ' ')}</span>
              </div>
            </div>
            <Button
              className="w-full bg-[#198754] hover:bg-[#157347] mt-2"
              onClick={() => { handleClose(false); }}
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
