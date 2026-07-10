'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import {
  Building2, Save, Upload, Globe, Palette, Users, GitBranch, Bell,
  UserCog, Plus, CheckCircle, Clock, XCircle, DollarSign, AlertTriangle, Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { INSTITUTION_TYPES, PRICING_DEFAULTS, PRICING_KEYS } from '@/lib/constants';
import { formatUsd } from '@/lib/pricing';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Institution {
  id: string;
  name: string;
  code: string;
  country: string;
  type: string;
  primary_color?: string;
  secondary_color?: string;
}

interface SeatRequest {
  id: string;
  seats_requested: number;
  seats_approved: number | null;
  status: 'pending' | 'approved' | 'rejected';
  requester_notes: string | null;
  reviewer_notes: string | null;
  created_at: string;
}

const STATUS_STYLES = {
  pending:  { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function InstitutionSettingsPage() {
  const { profile } = useAuth();
  const [institution, setInstitution] = useState<Institution | null>(null);

  useEffect(() => {
    if (!profile?.institution_id) return;
    supabase.from('institutions').select('id,name,code,country,type,primary_color,secondary_color')
      .eq('id', profile.institution_id).maybeSingle()
      .then(({ data }) => { if (data) setInstitution(data as Institution); });
  }, [profile]);

  const inst = institution ?? { id: '', name: '', code: '', country: 'Kenya', type: 'university', primary_color: '#0B5ED7', secondary_color: '#198754' };

  // Admin seat state
  const [adminSeatPrice, setAdminSeatPrice] = useState<number>(PRICING_DEFAULTS.adminSeatPriceUsd);
  const [seatsPurchased, setSeatsPurchased] = useState(0);
  const [seatRequests, setSeatRequests] = useState<SeatRequest[]>([]);
  const [seatsLoading, setSeatsLoading] = useState(true);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [seatsToRequest, setSeatsToRequest] = useState(1);
  const [requestNotes, setRequestNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Count of institution_admin profiles currently active
  const [seatsUsed, setSeatsUsed] = useState(0);

  useEffect(() => {
    loadAdminSeatData();
  }, [profile]);

  async function loadAdminSeatData() {
    if (!profile?.institution_id) return;
    setSeatsLoading(true);
    const [instRes, reqRes, priceRes, usedRes] = await Promise.all([
      supabase.from('institutions').select('admin_seats_purchased').eq('id', profile.institution_id).maybeSingle(),
      supabase.from('admin_seat_requests').select('id,seats_requested,seats_approved,status,requester_notes,reviewer_notes,created_at').eq('institution_id', profile.institution_id).order('created_at', { ascending: false }),
      supabase.from('platform_settings').select('value').eq('key', PRICING_KEYS.adminSeatPrice).maybeSingle(),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('institution_id', profile.institution_id).eq('role', 'institution_admin'),
    ]);
    if (instRes.data) setSeatsPurchased(instRes.data.admin_seats_purchased ?? 0);
    if (reqRes.data) setSeatRequests(reqRes.data as SeatRequest[]);
    if (priceRes.data) setAdminSeatPrice(parseFloat(priceRes.data.value) || PRICING_DEFAULTS.adminSeatPriceUsd);
    if (usedRes.count !== null) setSeatsUsed(usedRes.count);
    setSeatsLoading(false);
  }

  async function handleRequestSeats() {
    if (!profile?.institution_id || seatsToRequest < 1) return;
    setSubmitting(true);
    const { error } = await supabase.from('admin_seat_requests').insert({
      institution_id: profile.institution_id,
      seats_requested: seatsToRequest,
      requester_notes: requestNotes.trim() || null,
      requested_by: profile.id,
    });
    if (error) {
      toast.error('Failed to submit request. Please try again.');
    } else {
      toast.success('Admin seat request submitted. The platform team will review and confirm payment.');
      setRequestDialogOpen(false);
      setSeatsToRequest(1);
      setRequestNotes('');
      loadAdminSeatData();
    }
    setSubmitting(false);
  }

  function handleSave() {
    toast.success('Settings saved successfully!');
  }

  const pendingRequest = seatRequests.find(r => r.status === 'pending');
  const availableSeats = seatsPurchased - seatsUsed;

  return (
    <DashboardShell
      basePath="/dashboard/admin"
      demoRole="institution_admin"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard/admin' },
        { label: 'Institution Settings' },
      ]}
    >
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Institution Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Configure your institution profile and research policies</p>
        </div>
        <Button size="sm" onClick={handleSave} className="gap-2 h-9 bg-[#0B5ED7] hover:bg-[#0a52c4]">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="bg-slate-100 h-9 mb-6">
          <TabsTrigger value="profile" className="text-xs h-7 gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="admin-seats" className="text-xs h-7 gap-1.5">
            <UserCog className="w-3.5 h-3.5" />
            Admin Seats
          </TabsTrigger>
          <TabsTrigger value="branding" className="text-xs h-7 gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="workflow" className="text-xs h-7 gap-1.5">
            <GitBranch className="w-3.5 h-3.5" />
            Workflow
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs h-7 gap-1.5">
            <Bell className="w-3.5 h-3.5" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="departments" className="text-xs h-7 gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Departments
          </TabsTrigger>
        </TabsList>

        {/* Profile tab */}
        <TabsContent value="profile">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-5">Institution Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Institution Name</Label>
                <Input defaultValue={inst.name} className="bg-slate-50" />
              </div>
              <div className="space-y-1.5">
                <Label>Institution Code</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input defaultValue={inst.code} className="bg-slate-50 pl-8 font-mono" readOnly />
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Shared by all users — students, supervisors, examiners, and admins all register with this code.
                  Contact the platform team to change it.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Institution Type</Label>
                <Select defaultValue={inst.type}>
                  <SelectTrigger className="bg-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTITUTION_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input defaultValue={inst.country} className="bg-slate-50" />
              </div>
              <div className="space-y-1.5">
                <Label>Website</Label>
                <Input placeholder="https://university.edu" className="bg-slate-50" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Address</Label>
                <Input placeholder="123 University Avenue, City" className="bg-slate-50" />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Admin Seats tab ── */}
        <TabsContent value="admin-seats">
          <div className="space-y-5">
            {/* How it works */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <UserCog className="w-5 h-5 text-[#0B5ED7] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">About Admin Seats</p>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    Admin accounts allow staff to manage users, configure workflows, and oversee research programs.
                    Each admin seat costs <strong>{formatUsd(adminSeatPrice)}</strong> and must be approved by the ResearchFlow platform team after payment.
                    You can purchase one seat per faculty, school, or organizational unit.
                  </p>
                </div>
              </div>
            </div>

            {/* Seat summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm text-center">
                <p className="text-3xl font-bold text-slate-900">{seatsLoading ? '–' : seatsPurchased}</p>
                <p className="text-sm text-slate-500 mt-1">Seats purchased</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm text-center">
                <p className="text-3xl font-bold text-[#0B5ED7]">{seatsLoading ? '–' : seatsUsed}</p>
                <p className="text-sm text-slate-500 mt-1">Seats in use</p>
              </div>
              <div className={cn(
                'border rounded-xl p-5 shadow-sm text-center',
                !seatsLoading && availableSeats < 1 ? 'bg-amber-50 border-amber-100' : 'bg-white border-slate-100'
              )}>
                <p className={cn(
                  'text-3xl font-bold',
                  !seatsLoading && availableSeats < 1 ? 'text-amber-600' : 'text-[#198754]'
                )}>
                  {seatsLoading ? '–' : availableSeats}
                </p>
                <p className="text-sm text-slate-500 mt-1">Available seats</p>
              </div>
            </div>

            {/* No seats warning */}
            {!seatsLoading && seatsPurchased === 0 && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Your institution has not purchased any admin seats yet. Request at least one seat to enable admin accounts.
                  Each admin seat costs <strong>{formatUsd(adminSeatPrice)}</strong> and is activated after payment is confirmed.
                </p>
              </div>
            )}

            {/* Request seats CTA */}
            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-slate-800">Request additional admin seats</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Each seat costs <strong>{formatUsd(adminSeatPrice)}</strong>. The platform team will review your request and confirm payment before activation.
                </p>
              </div>
              <Button
                size="sm"
                className="gap-2 bg-[#0B5ED7] hover:bg-[#0a52c4] shrink-0"
                disabled={!!pendingRequest}
                onClick={() => setRequestDialogOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Request seats
              </Button>
            </div>

            {pendingRequest && (
              <div className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                <Clock className="w-4 h-4 shrink-0" />
                You have a pending request for <strong>{pendingRequest.seats_requested}</strong> seat{pendingRequest.seats_requested !== 1 ? 's' : ''} ({formatUsd(pendingRequest.seats_requested * adminSeatPrice)}).
                A new request cannot be submitted until this one is reviewed.
              </div>
            )}

            {/* Request history */}
            {seatRequests.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-50">
                  <p className="text-sm font-semibold text-slate-800">Request History</p>
                </div>
                <div className="divide-y divide-slate-50">
                  {seatRequests.map(req => {
                    const style = STATUS_STYLES[req.status];
                    const Icon = style.icon;
                    return (
                      <div key={req.id} className="px-5 py-4 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                            req.status === 'pending' ? 'bg-amber-50' :
                            req.status === 'approved' ? 'bg-green-50' : 'bg-red-50'
                          )}>
                            <Icon className={cn('w-4 h-4',
                              req.status === 'pending' ? 'text-amber-600' :
                              req.status === 'approved' ? 'text-[#198754]' : 'text-red-500'
                            )} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-700">
                              {req.seats_requested} admin seat{req.seats_requested !== 1 ? 's' : ''} requested
                              <span className="text-slate-400 font-normal ml-2">
                                &mdash; {formatUsd(req.seats_requested * adminSeatPrice)}
                              </span>
                            </p>
                            {req.status === 'approved' && req.seats_approved != null && (
                              <p className="text-xs text-[#198754] mt-0.5">{req.seats_approved} seat{req.seats_approved !== 1 ? 's' : ''} activated</p>
                            )}
                            {req.reviewer_notes && (
                              <p className="text-xs text-slate-500 mt-1 bg-slate-50 px-2 py-1 rounded">
                                Platform note: {req.reviewer_notes}
                              </p>
                            )}
                            {req.requester_notes && (
                              <p className="text-xs text-slate-400 mt-1">Your note: {req.requester_notes}</p>
                            )}
                            <p className="text-xs text-slate-400 mt-1">
                              {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <Badge className={cn('text-xs border-0 shrink-0 capitalize', style.color)}>
                          {style.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Branding tab */}
        <TabsContent value="branding">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-5">Branding & Appearance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <Label className="mb-2 block">Institution Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-[#0B5ED7] rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                    {inst.code.slice(0, 2)}
                  </div>
                  <div>
                    <Button variant="outline" size="sm" className="gap-2 h-9">
                      <Upload className="w-4 h-4" />
                      Upload Logo
                    </Button>
                    <p className="text-xs text-slate-400 mt-1.5">PNG, SVG, JPG up to 2MB. Recommended: 200x200px</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Primary Color</Label>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg border border-slate-200" style={{ backgroundColor: inst.primary_color }} />
                  <Input defaultValue={inst.primary_color} className="bg-slate-50 flex-1" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Secondary Color</Label>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg border border-slate-200" style={{ backgroundColor: inst.secondary_color }} />
                  <Input defaultValue={inst.secondary_color} className="bg-slate-50 flex-1" />
                </div>
              </div>
              <div className="sm:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-3">Preview</p>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: inst.primary_color }}>
                    {inst.code.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{inst.name}</p>
                    <p className="text-xs text-slate-400">ResearchFlow Portal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Workflow tab */}
        <TabsContent value="workflow">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-2">Workflow Configuration</h2>
            <p className="text-sm text-slate-500 mb-5">Configure which stages are enabled and timelines for your institution.</p>
            <div className="space-y-4">
              {[
                { stage: 'Concept Paper', enabled: true, weeks: 4 },
                { stage: 'Supervisor Allocation', enabled: true, weeks: 2 },
                { stage: 'Proposal Development', enabled: true, weeks: 8 },
                { stage: 'Proposal Defense', enabled: true, weeks: 2 },
                { stage: 'Data Collection Authorization', enabled: true, weeks: 2 },
                { stage: 'Data Collection & Report', enabled: true, weeks: 16 },
                { stage: 'Final Defense', enabled: true, weeks: 4 },
                { stage: 'Corrections', enabled: true, weeks: 6 },
                { stage: 'Peer Review', enabled: true, weeks: 4 },
                { stage: 'Repository Submission', enabled: true, weeks: 2 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Switch defaultChecked={item.enabled} />
                    <span className="text-sm font-medium text-slate-700">{item.stage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Max weeks:</span>
                    <Input type="number" defaultValue={item.weeks} className="w-16 h-8 text-xs text-center bg-white" min={1} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Notifications tab */}
        <TabsContent value="notifications">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-5">Notification Settings</h2>
            <div className="space-y-4">
              {[
                { label: 'Email notifications for stage transitions', desc: 'Send email when a project moves to a new stage' },
                { label: 'Deadline reminder emails', desc: 'Send reminders 7 days, 3 days, and 1 day before deadlines' },
                { label: 'Supervisor allocation notifications', desc: 'Notify supervisors when assigned to a new project' },
                { label: 'Defense scheduling notifications', desc: 'Alert panel members when a defense is scheduled' },
                { label: 'Overdue project escalation', desc: 'Escalate to coordinator when project exceeds timeline' },
                { label: 'Peer review reminders', desc: 'Remind reviewers of upcoming peer review deadlines' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Departments tab */}
        <TabsContent value="departments">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-slate-800">Faculties & Departments</h2>
              <Button size="sm" className="gap-2 h-8 bg-[#0B5ED7] hover:bg-[#0a52c4] text-xs">Add Department</Button>
            </div>
            <div className="space-y-4">
              {[
                { faculty: 'Science & Technology', departments: ['Computer Science', 'Information Technology', 'Mathematics', 'Physics'] },
                { faculty: 'Business', departments: ['Business Administration', 'Accounting', 'Economics', 'Marketing'] },
                { faculty: 'Social Sciences', departments: ['Sociology', 'Psychology', 'Political Science', 'Education'] },
                { faculty: 'Health Sciences', departments: ['Nursing', 'Public Health', 'Clinical Medicine'] },
              ].map(fac => (
                <div key={fac.faculty} className="border border-slate-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-slate-800 text-sm">{fac.faculty}</p>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500">Edit</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {fac.departments.map(dept => (
                      <Badge key={dept} variant="outline" className="text-xs">{dept}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Request seats dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5 text-[#0B5ED7]" />
              Request Admin Seats
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <p className="text-sm text-slate-600">
              Each admin seat costs <strong>{formatUsd(adminSeatPrice)}</strong>. Specify how many seats you need (e.g. one per faculty or school).
              Your request will be reviewed and activated after payment is confirmed.
            </p>

            <div className="space-y-1.5">
              <Label>Number of admin seats</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={seatsToRequest}
                onChange={e => setSeatsToRequest(Math.max(1, parseInt(e.target.value) || 1))}
                className="bg-slate-50 w-32"
              />
              <p className="text-xs text-slate-400">Minimum 1. Each seat is one admin account.</p>
            </div>

            {seatsToRequest >= 1 && (
              <div className="flex items-center justify-between p-3.5 bg-green-50 border border-green-100 rounded-xl text-sm">
                <span className="text-slate-600">Total amount due</span>
                <span className="font-bold text-[#198754] text-base">{formatUsd(seatsToRequest * adminSeatPrice)}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Notes <span className="text-slate-400 font-normal">(optional)</span></Label>
              <Textarea
                placeholder="e.g. 2 seats — one for Faculty of Science, one for Faculty of Business"
                value={requestNotes}
                onChange={e => setRequestNotes(e.target.value)}
                rows={3}
                className="resize-none text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              className="bg-[#0B5ED7] hover:bg-[#0a52c4]"
              disabled={submitting || seatsToRequest < 1}
              onClick={handleRequestSeats}
            >
              {submitting ? 'Submitting…' : `Submit request — ${formatUsd(seatsToRequest * adminSeatPrice)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
