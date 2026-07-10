'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { supabase } from '@/lib/supabase';
import {
  University, Search, Plus, ChevronDown, ChevronUp,
  Eye, EyeOff, Edit2, Check, X, Loader2, Filter,
  Users, FolderOpen, MapPin, Globe2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { University as UniversityType } from '@/types';

interface UniversityRow extends UniversityType {
  student_count?: number;
  supervisor_count?: number;
  project_count?: number;
}

const EMPTY_FORM = {
  name: '', code: '', type: 'public' as 'public' | 'private',
  country: 'Kenya', county: '', website: '', status: 'active' as 'active' | 'inactive',
};

export default function UniversitiesAdminPage() {
  const [universities, setUniversities] = useState<UniversityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [sortField, setSortField] = useState<'name' | 'type' | 'county' | 'country'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UniversityRow | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function loadUniversities() {
    setLoading(true);
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .order('name');
    if (error) { toast.error('Failed to load universities'); setLoading(false); return; }
    setUniversities((data as UniversityRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { loadUniversities(); }, []);

  const countries = useMemo(() => {
    const seen = new Set<string>();
    universities.forEach(u => seen.add(u.country));
    return ['all', ...Array.from(seen).sort()];
  }, [universities]);

  const filtered = useMemo(() => {
    let list = universities;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.code.toLowerCase().includes(q) ||
        (u.county ?? '').toLowerCase().includes(q) ||
        u.country.toLowerCase().includes(q)
      );
    }
    if (filterType !== 'all') list = list.filter(u => u.type === filterType);
    if (filterStatus !== 'all') list = list.filter(u => u.status === filterStatus);
    if (filterCountry !== 'all') list = list.filter(u => u.country === filterCountry);

    list = [...list].sort((a, b) => {
      const va = (a[sortField] ?? '').toLowerCase();
      const vb = (b[sortField] ?? '').toLowerCase();
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return list;
  }, [universities, search, filterType, filterStatus, filterCountry, sortField, sortDir]);

  const stats = useMemo(() => ({
    total: universities.length,
    public: universities.filter(u => u.type === 'public').length,
    private: universities.filter(u => u.type === 'private').length,
    active: universities.filter(u => u.status === 'active').length,
    countries: new Set(universities.map(u => u.country)).size,
  }), [universities]);

  function toggleSort(field: typeof sortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setFormError(null);
    setAddOpen(true);
  }

  function openEdit(u: UniversityRow) {
    setForm({
      name: u.name, code: u.code, type: u.type,
      country: u.country, county: u.county ?? '',
      website: u.website ?? '', status: u.status,
    });
    setFormError(null);
    setEditTarget(u);
  }

  async function submitAdd() {
    if (!form.name.trim() || !form.code.trim()) {
      setFormError('Name and code are required.');
      return;
    }
    setFormLoading(true);
    setFormError(null);
    const { error } = await supabase.from('universities').insert({
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      type: form.type,
      country: form.country.trim() || 'Kenya',
      county: form.county.trim() || null,
      website: form.website.trim() || null,
      status: form.status,
    });
    setFormLoading(false);
    if (error) { setFormError(error.message); return; }
    toast.success('University added successfully.');
    setAddOpen(false);
    loadUniversities();
  }

  async function submitEdit() {
    if (!editTarget || !form.name.trim() || !form.code.trim()) {
      setFormError('Name and code are required.');
      return;
    }
    setFormLoading(true);
    setFormError(null);
    const { error } = await supabase.from('universities').update({
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      type: form.type,
      country: form.country.trim() || 'Kenya',
      county: form.county.trim() || null,
      website: form.website.trim() || null,
      status: form.status,
      updated_at: new Date().toISOString(),
    }).eq('id', editTarget.id);
    setFormLoading(false);
    if (error) { setFormError(error.message); return; }
    toast.success('University updated.');
    setEditTarget(null);
    loadUniversities();
  }

  async function toggleStatus(u: UniversityRow) {
    const next = u.status === 'active' ? 'inactive' : 'active';
    const { error } = await supabase.from('universities')
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq('id', u.id);
    if (error) { toast.error('Failed to update status'); return; }
    toast.success(`${u.name} ${next === 'active' ? 'activated' : 'deactivated'}.`);
    setUniversities(prev => prev.map(x => x.id === u.id ? { ...x, status: next } : x));
  }

  function SortIcon({ field }: { field: typeof sortField }) {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 text-slate-300" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-[#0B5ED7]" />
      : <ChevronDown className="w-3 h-3 text-[#0B5ED7]" />;
  }

  const FormDialog = ({ title, onSubmit, open, onClose }: {
    title: string; onSubmit: () => void; open: boolean; onClose: () => void;
  }) => (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <University className="w-4 h-4 text-[#0B5ED7]" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {formError && (
            <p className="text-xs text-destructive bg-red-50 border border-red-100 rounded-lg px-3 py-2">{formError}</p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>University Name <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g. University of Nairobi"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Code <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g. UON"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v: 'public' | 'private') => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Input
                placeholder="Kenya"
                value={form.country}
                onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>County / State</Label>
              <Input
                placeholder="e.g. Nairobi"
                value={form.county}
                onChange={e => setForm(f => ({ ...f, county: e.target.value }))}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Website</Label>
              <Input
                placeholder="https://university.ac.ke"
                value={form.website}
                onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v: 'active' | 'inactive') => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            className="bg-[#0B5ED7] hover:bg-[#0a52c4]"
            onClick={onSubmit}
            disabled={formLoading}
          >
            {formLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <DashboardShell
      basePath="/dashboard/super-admin"
      demoRole="super_admin"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard/super-admin' },
        { label: 'Universities' },
      ]}
    >
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">University Registry</h1>
          <p className="text-slate-500 text-sm mt-1">
            {stats.total} universities across {stats.countries} {stats.countries === 1 ? 'country' : 'countries'}
          </p>
        </div>
        <Button size="sm" className="gap-2 h-9 bg-[#0B5ED7] hover:bg-[#0a52c4]" onClick={openAdd}>
          <Plus className="w-4 h-4" />
          Add University
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-800' },
          { label: 'Public', value: stats.public, color: 'text-[#0B5ED7]' },
          { label: 'Private', value: stats.private, color: 'text-amber-600' },
          { label: 'Active', value: stats.active, color: 'text-[#198754]' },
          { label: 'Countries', value: stats.countries, color: 'text-slate-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-4 text-center shadow-sm">
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 mb-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search universities…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={filterType} onValueChange={(v: typeof filterType) => setFilterType(v)}>
            <SelectTrigger className="h-9 w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(v: typeof filterStatus) => setFilterStatus(v)}>
            <SelectTrigger className="h-9 w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {countries.length > 2 && (
            <Select value={filterCountry} onValueChange={setFilterCountry}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(c => (
                  <SelectItem key={c} value={c}>{c === 'all' ? 'All Countries' : c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <p className="text-xs text-slate-400 ml-auto shrink-0">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading universities…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <University className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-sm font-semibold text-slate-600">No universities found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or add a new university.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">
                    <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort('name')}>
                      University <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Code</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">
                    <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort('type')}>
                      Type <SortIcon field="type" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">
                    <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort('county')}>
                      County <SortIcon field="county" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">
                    <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort('country')}>
                      Country <SortIcon field="country" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(u => (
                  <tr key={u.id} className={cn('hover:bg-slate-50/50 transition-colors', u.status === 'inactive' && 'opacity-60')}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 leading-tight">{u.name}</p>
                      {u.website && (
                        <a href={u.website} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0B5ED7] hover:underline mt-0.5 inline-block">
                          {u.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{u.code}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn(
                        'text-xs border-0 capitalize',
                        u.type === 'public' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      )}>
                        {u.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-slate-500">
                        {u.county && <MapPin className="w-3 h-3 shrink-0" />}
                        <span className="text-xs">{u.county ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Globe2 className="w-3 h-3 shrink-0" />
                        <span className="text-xs">{u.country}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn(
                        'text-xs border-0',
                        u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      )}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost" size="sm"
                          className="h-7 w-7 p-0 text-slate-400 hover:text-[#0B5ED7]"
                          onClick={() => openEdit(u)}
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          className={cn(
                            'h-7 w-7 p-0',
                            u.status === 'active'
                              ? 'text-slate-400 hover:text-red-500'
                              : 'text-slate-400 hover:text-[#198754]'
                          )}
                          onClick={() => toggleStatus(u)}
                          title={u.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {u.status === 'active'
                            ? <EyeOff className="w-3.5 h-3.5" />
                            : <Eye className="w-3.5 h-3.5" />
                          }
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add dialog */}
      <FormDialog
        title="Add University"
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={submitAdd}
      />

      {/* Edit dialog */}
      <FormDialog
        title="Edit University"
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        onSubmit={submitEdit}
      />
    </DashboardShell>
  );
}
