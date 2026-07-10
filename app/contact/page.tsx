'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import PublicNav from '@/components/layout/PublicNav';
import PublicFooter from '@/components/layout/PublicFooter';

const CONTACT_INFO = [
  { icon: Mail, label: 'Email', value: 'info@researchflow.io', sub: 'We respond within 24 hours' },
  { icon: Phone, label: 'Phone', value: '+254 700 000 000', sub: 'Mon–Fri, 8am–6pm EAT' },
  { icon: MapPin, label: 'Office', value: 'Nairobi, Kenya', sub: 'The Hub Karen, Nairobi' },
  { icon: Clock, label: 'Support hours', value: '8am – 6pm EAT', sub: 'Monday through Friday' },
];

type FormState = 'idle' | 'sending' | 'sent';

export default function ContactPage() {
  const [formState, setFormState] = useState<FormState>('idle');
  const [form, setForm] = useState({
    name: '', email: '', institution: '', subject: '', role: '', message: ''
  });

  function handleChange(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState('sending');
    await new Promise(r => setTimeout(r, 1200));
    setFormState('sent');
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-blue-500/20 text-blue-200 border-blue-400/30 hover:bg-blue-500/20">Contact Us</Badge>
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
            Get in touch with<br />
            <span className="text-blue-400">our team</span>
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            Whether you are a student with a question, an institution exploring a partnership, or a developer with a technical query — we are here.
          </p>
        </div>
      </section>

      {/* Contact grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Info column */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact information</h2>
              <div className="space-y-5 mb-10">
                {CONTACT_INFO.map(info => (
                  <div key={info.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#0B5ED7]/10 rounded-xl flex items-center justify-center shrink-0">
                      <info.icon className="w-5 h-5 text-[#0B5ED7]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{info.value}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{info.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h3 className="font-semibold text-slate-800 mb-2">For institutions</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  If you are representing a university or college interested in deploying ResearchFlow for your institution, our sales team will be happy to provide a customized demo and pricing proposal.
                </p>
                <Badge className="bg-blue-50 text-[#0B5ED7] border-blue-100">sales@researchflow.io</Badge>
              </div>
            </div>

            {/* Form column */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-8">
                {formState === 'sent' ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-[#198754]" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Message sent!</h3>
                    <p className="text-slate-500">We have received your message and will get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name">Full name</Label>
                        <Input
                          id="name"
                          placeholder="Dr. Jane Smith"
                          value={form.name}
                          onChange={e => handleChange('name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="jane@university.ac.ke"
                          value={form.email}
                          onChange={e => handleChange('email', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="institution">Institution</Label>
                        <Input
                          id="institution"
                          placeholder="University of Nairobi"
                          value={form.institution}
                          onChange={e => handleChange('institution', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>I am a</Label>
                        <Select onValueChange={v => handleChange('role', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="supervisor">Supervisor / Lecturer</SelectItem>
                            <SelectItem value="coordinator">Research Coordinator</SelectItem>
                            <SelectItem value="admin">Institution Administrator</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="How can we help?"
                        value={form.subject}
                        onChange={e => handleChange('subject', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Describe your question or requirement in detail..."
                        rows={5}
                        value={form.message}
                        onChange={e => handleChange('message', e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-[#0B5ED7] hover:bg-[#0a52c4] h-11 gap-2"
                      disabled={formState === 'sending'}
                    >
                      {formState === 'sending' ? 'Sending...' : (
                        <>Send message <Send className="w-4 h-4" /></>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
