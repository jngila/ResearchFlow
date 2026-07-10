'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import StatCard from '@/components/dashboard/StatCard';
import {
  Building2, Globe2, CheckCircle, ShieldAlert, Search, Plus,
  MoreHorizontal, Eye, Edit, Trash2, UserCog, Clock, XCircle,
  ChevronRight, DollarSign, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { PRICING_DEFAULTS, PRICING_KEYS } from '@/lib/constants';
import { formatUsd } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Institution {
  id: string;
  name: string;
  code: string;
  country: string;
  type: string;
  primary_color: string;
  subscription_status: 'trial' | 'active' | 'suspended' | 'expired';
  admin_seats_purchased: number;
  created_at: string;
}

interface SeatRequest {
  id: string;
  institution_id: string;
  seats_requested: number;
  seats_approved: number | null;
  status: 'pending' | 'approved' | 'rejected';
  requester_notes: string | null;
  reviewer_notes: string | null;
  created_at: string;
  institution: { name: string; code: string; country: string } | null;
}

const SUB_COLORS = {
  active: 'bg-green-100 text-green-700',
  trial: 'bg-amber-100 text-amber-700',
  suspended: 'bg-red-100 text-red-700',
  expired: 'bg-slate-100 text-slate-500',
};

const INST_TYPE_LABELS: Record<string, string> = {
  university: 'University',
  college: 'College',
  tvet: 'TVET',
  research_org: 'Research Org',
};

export default function InstitutionsPage() {
  const [search, setSearch] = useState('');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [seatRequests, setSeatRequests] = useState<SeatRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminSeatPrice, setAdminSeatPrice] = useState<number>(PRICING_DEFAULTS.adminSeatPriceUsd);

  // Review dialog state
  const [reviewTarget, setReviewTarget] = useState<SeatRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    const [instRes, reqRes, priceRes] = await Promise.all([
      supabase.from('institutions').select('id,name,code,country,type,primary_color,subscription_status,admin_seats_purchased,created_at').order('name'),
      supabase.from('admin_seat_requests').select('id,institution_id,seats_requested,seats_approved,status,requester_notes,reviewer_notes,created_at,institution:institutions(name,code,country)').order('created_at', { ascending: false }),
      supabase.from('platform_settings').select('value').eq('key', PRICING_KEYS.adminSeatPrice).maybeSingle(),
    ]);
    if (instRes.data) setInstitutions(instRes.data as Institution[]);
    if (reqRes.data) setSeatRequests(reqRes.data as unknown as SeatRequest[]);
    if (priceRes.data) setAdminSeatPrice(parseFloat(priceRes.data.value) || PRICING_DEFAULTS.adminSeatPriceUsd);
    setLoading(false);
  }

  const filtered = institutions.filter(inst =>
    inst.name.toLowerCase().includes(search.toLowerCase()) ||
    inst.code.toLowerCase().includes(search.toLowerCase())
  );

  const pendingRequests = seatRequests.filter(r => r.status === 'pending');
  const processedRequests = seatRequests.filter(r => r.status !== 'pending');

  async function handleReview(decision: 'approved' | 'rejected') {
    if (!reviewTarget) return;
    setReviewing(true);

    const seatsApproved = decision === 'approved' ? reviewTarget.seats_requested : 0;

    const { error } = await supabase
      .from('admin_seat_requests')
      .update({
        status: decision,
        seats_approved: seatsApproved,
        reviewer_notes: reviewNotes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', reviewTarget.id);

    if (error) {
      toast.error('Failed to update request. Please try again.');
      setReviewing(false);
      return;
    }

    if (decision === 'approved') {
      // Increment admin_seats_purchased on the institution
      const inst = institutions.find(i => i.id === reviewTarget.institution_id);
      const current = inst?.admin_seats_purchased ?? 0;
      await supabase
        .from('institutions')
        .update({ admin_seats_purchased: current + seatsApproved })
        .eq('id', reviewTarget.institution_id);
    }

    toast.success(decision === 'approved' ? `Approved ${seatsApproved} admin seat(s).` : 'Request rejected.');
    setReviewTarget(null);
    setReviewNotes('');
    setReviewing(false);
    loadAll();
  }

  return (
    <DashboardShell
      basePath="/dashboard/super-admin"
      demoRole="super_admin"
      breadcrumbs={[
        { label: 'Platform Dashboard', href: '/dashboard/super-admin' },
        { label: 'Institutions' },
      ]}
    >
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Institutions</h1>
          <p className="text-slate-500 text-sm mt-1">{institutions.length} registered institutions</p>
        </div>
        <Button size="sm" className="gap-2 h-9 bg-[#0B5ED7] hover:bg-[#0a52c4]">
          <Plus className="w-4 h-4" />
          Add Institution
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Institutions" value={institutions.length || 0} icon={Building2} color="blue" />
        <StatCard label="Active Subscriptions" value={institutions.filter(i => i.subscription_status === 'active').length || 0} icon={CheckCircle} color="green" />
        <StatCard label="Trial Accounts" value={institutions.filter(i => i.subscription_status === 'trial').length || 0} icon={ShieldAlert} color="amber" />
        <StatCard label="Pending Admin Requests" value={pendingRequests.length} icon={UserCog} color="purple" />
      </div>

      <Tabs defaultValue="institutions">
        <TabsList className="mb-5">
          <TabsTrigger value="institutions">All Institutions</TabsTrigger>
          <TabsTrigger value="admin-seats" className="relative">
            Admin Seat Requests
            {pendingRequests.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ─── INSTITUTIONS TAB ─── */}
        <TabsContent value="institutions">
          <div className="bg-white rounded-xl border border-slate-100 p-4 mb-5 flex flex-wrap gap-3 items-center shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search institutions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9 bg-slate-50 border-slate-200 text-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm animate-pulse h-52" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-100">
              <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No institutions found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(inst => (
                <div key={inst.id} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                        style={{ backgroundColor: inst.primary_color || '#0B5ED7' }}
                      >
                        {inst.code.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm leading-tight">{inst.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{inst.code} &bull; {inst.country}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem className="gap-2 text-sm cursor-pointer">
                          <Eye className="w-3.5 h-3.5" /> View details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-sm cursor-pointer">
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-sm text-red-500 cursor-pointer focus:text-red-500 focus:bg-red-50">
                          <Trash2 className="w-3.5 h-3.5" /> Suspend
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={cn('text-xs border-0', SUB_COLORS[inst.subscription_status])}>
                      {inst.subscription_status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {INST_TYPE_LABELS[inst.type] ?? inst.type}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center mb-4">
                    <div className="bg-slate-50 rounded-lg px-2 py-2">
                      <p className="text-sm font-bold text-slate-800">{inst.admin_seats_purchased}</p>
                      <p className="text-xs text-slate-400">Admin seats</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg px-2 py-2">
                      <p className="text-xs text-slate-400 mt-0.5 capitalize">{inst.code}</p>
                      <p className="text-xs text-slate-400">Code</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      Joined {new Date(inst.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </p>
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-[#0B5ED7] hover:bg-blue-50 gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── ADMIN SEAT REQUESTS TAB ─── */}
        <TabsContent value="admin-seats">
          {/* Admin seat price info banner */}
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800 mb-5">
            <DollarSign className="w-4 h-4 shrink-0 text-[#0B5ED7]" />
            <p>
              Each admin seat costs <strong>{formatUsd(adminSeatPrice)}</strong>. Approve requests only after confirming payment with the institution.
              The seat count is applied to the institution upon approval.
            </p>
          </div>

          {/* Pending requests */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Pending Requests
              {pendingRequests.length > 0 && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                  {pendingRequests.length}
                </span>
              )}
            </h2>

            {pendingRequests.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl border border-slate-100 border-dashed">
                <Clock className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No pending admin seat requests.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map(req => {
                  const totalCost = req.seats_requested * adminSeatPrice;
                  return (
                    <div key={req.id} className="bg-white rounded-xl border border-amber-100 shadow-sm p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                            <UserCog className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">
                              {req.institution?.name ?? 'Unknown institution'}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Code: <span className="font-mono">{req.institution?.code}</span>
                              &nbsp;&bull;&nbsp;{req.institution?.country}
                            </p>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-600">
                              <span className="flex items-center gap-1">
                                <UserCog className="w-3.5 h-3.5 text-slate-400" />
                                <strong>{req.seats_requested}</strong> admin seat{req.seats_requested !== 1 ? 's' : ''} requested
                              </span>
                              <span className="flex items-center gap-1 text-[#198754] font-medium">
                                <DollarSign className="w-3.5 h-3.5" />
                                {formatUsd(totalCost)} due
                              </span>
                              <span className="text-slate-400">
                                {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            {req.requester_notes && (
                              <p className="text-xs text-slate-500 mt-2 bg-slate-50 px-3 py-2 rounded-lg">
                                <span className="font-medium">Notes:</span> {req.requester_notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => { setReviewTarget(req); setReviewNotes(''); }}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-[#198754] hover:bg-[#157347]"
                            onClick={() => { setReviewTarget(req); setReviewNotes(''); }}
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Review &amp; Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Processed requests */}
          {processedRequests.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-slate-400" />
                Processed Requests
              </h2>
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm divide-y divide-slate-50">
                {processedRequests.map(req => (
                  <div key={req.id} className="flex items-center justify-between px-5 py-4 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                        req.status === 'approved' ? 'bg-green-50' : 'bg-red-50'
                      )}>
                        {req.status === 'approved'
                          ? <CheckCircle className="w-4 h-4 text-[#198754]" />
                          : <XCircle className="w-4 h-4 text-red-500" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">
                          {req.institution?.name ?? 'Unknown'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {req.seats_requested} seat{req.seats_requested !== 1 ? 's' : ''} requested
                          {req.status === 'approved' && req.seats_approved != null && ` · ${req.seats_approved} approved`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge className={cn('text-xs border-0 capitalize',
                        req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      )}>
                        {req.status}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review dialog */}
      <Dialog open={!!reviewTarget} onOpenChange={open => { if (!open) setReviewTarget(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5 text-[#0B5ED7]" />
              Review Admin Seat Request
            </DialogTitle>
          </DialogHeader>

          {reviewTarget && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Institution</span>
                  <span className="font-medium text-slate-800">{reviewTarget.institution?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Seats requested</span>
                  <span className="font-medium text-slate-800">{reviewTarget.seats_requested}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount due</span>
                  <span className="font-semibold text-[#198754]">{formatUsd(reviewTarget.seats_requested * adminSeatPrice)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                Confirm payment of {formatUsd(reviewTarget.seats_requested * adminSeatPrice)} has been received before approving.
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Reviewer notes (optional)</Label>
                <Textarea
                  placeholder="e.g. Payment received via bank transfer ref. #12345"
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  rows={3}
                  className="resize-none text-sm"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              disabled={reviewing}
              onClick={() => handleReview('rejected')}
            >
              <XCircle className="w-4 h-4 mr-1.5" />
              Reject
            </Button>
            <Button
              className="bg-[#198754] hover:bg-[#157347]"
              disabled={reviewing}
              onClick={() => handleReview('approved')}
            >
              <CheckCircle className="w-4 h-4 mr-1.5" />
              Approve &amp; Activate Seats
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
