'use client';

import { useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { User, Save, GraduationCap, Hash, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ROLE_LABELS } from '@/lib/constants';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

export default function ProfilePage() {
  const { profile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    phone: (profile as any)?.phone ?? '',
    school_faculty: profile?.school_faculty ?? '',
    programme: profile?.programme ?? '',
    registration_number: profile?.registration_number ?? '',
  });

  function handleChange(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        school_faculty: form.school_faculty,
        programme: form.programme,
        registration_number: form.registration_number,
      })
      .eq('id', profile.id);
    if (error) toast.error('Failed to save profile');
    else toast.success('Profile updated');
    setSaving(false);
  }

  if (!profile) return null;

  return (
    <DashboardShell
      basePath="/dashboard/student"
      title="My Profile"
      breadcrumbs={[{ label: 'Student', href: '/dashboard/student' }, { label: 'Profile' }]}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Avatar card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center gap-5">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-[#0B5ED7] text-white text-xl font-bold">
              {initials(profile.full_name ?? 'U')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{profile.full_name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-blue-50 text-[#0B5ED7] border-blue-100 text-xs">
                {ROLE_LABELS[profile.role]}
              </Badge>
              {profile.researchflow_id && (
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Hash className="w-3 h-3" />{profile.researchflow_id}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Personal info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" /> Personal Information
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input
                value={form.full_name}
                onChange={e => handleChange('full_name', e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone Number</Label>
              <Input
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
                placeholder="+254 700 000 000"
                disabled
              />
              <p className="text-xs text-slate-400">Contact support to update your phone number.</p>
            </div>
          </div>
        </div>

        {/* Academic info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-slate-400" /> Academic Information
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label>School / Faculty</Label>
              <Input
                value={form.school_faculty}
                onChange={e => handleChange('school_faculty', e.target.value)}
                placeholder="e.g. School of Computing"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Programme / Course</Label>
              <Input
                value={form.programme}
                onChange={e => handleChange('programme', e.target.value)}
                placeholder="e.g. MSc Computer Science"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Registration Number</Label>
              <Input
                value={form.registration_number}
                onChange={e => handleChange('registration_number', e.target.value)}
                placeholder="e.g. SCT/13/21"
              />
            </div>
            {profile.level_of_study && (
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600">Level of study:</span>
                <Badge className="bg-slate-100 text-slate-700 border-0 capitalize text-xs">{profile.level_of_study}</Badge>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#0B5ED7] hover:bg-[#0a52c4] h-11 gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </DashboardShell>
  );
}
