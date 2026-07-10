'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/lib/constants';
import { Search, Plus, Download, MoreHorizontal, Mail, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';

const ROLE_COLORS: Record<UserRole, string> = {
  student: 'bg-blue-100 text-blue-700',
  supervisor: 'bg-green-100 text-green-700',
  coordinator: 'bg-purple-100 text-purple-700',
  examiner: 'bg-amber-100 text-amber-700',
  peer_reviewer: 'bg-teal-100 text-teal-700',
  institution_admin: 'bg-slate-100 text-slate-700',
  super_admin: 'bg-red-100 text-red-700',
};

interface UserRow {
  id: string;
  full_name: string;
  role: UserRole;
  department: string | null;
  faculty: string | null;
  is_active: boolean;
  created_at: string;
  email?: string;
}

export default function UsersPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    if (!profile?.institution_id) return;
    supabase
      .from('profiles')
      .select('id, full_name, role, department, faculty, is_active, created_at')
      .eq('institution_id', profile.institution_id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setUsers(data as UserRow[]);
        setLoading(false);
      });
  }, [profile]);

  const filtered = users.filter(u => {
    const matchSearch = u.full_name.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roles: UserRole[] = ['student', 'supervisor', 'coordinator', 'examiner', 'peer_reviewer', 'institution_admin'];

  return (
    <DashboardShell
      basePath="/dashboard/admin"
      demoRole="institution_admin"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard/admin' },
        { label: 'Users' },
      ]}
    >
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">{loading ? '…' : `${users.length} users in your institution`}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 h-9">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button size="sm" className="gap-2 h-9 bg-[#0B5ED7] hover:bg-[#0a52c4]">
            <Plus className="w-4 h-4" />
            Invite User
          </Button>
        </div>
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-5">
        {roles.map(role => {
          const count = users.filter(u => u.role === role).length;
          return (
            <div key={role} className="bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm text-center">
              {loading ? <Skeleton className="h-6 w-8 mx-auto mb-1" /> : (
                <p className="text-xl font-bold text-slate-900">{count}</p>
              )}
              <p className="text-xs text-slate-500 mt-0.5 leading-tight">{ROLE_LABELS[role].split(' ')[0]}</p>
            </div>
          );
        })}
        <div className="bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm text-center">
          {loading ? <Skeleton className="h-6 w-8 mx-auto mb-1" /> : (
            <p className="text-xl font-bold text-slate-900">{users.length}</p>
          )}
          <p className="text-xs text-slate-500 mt-0.5">Total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 mb-5 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 bg-slate-50 border-slate-200 text-sm"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-44 h-9 text-sm bg-slate-50 border-slate-200">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {roles.map(r => (
              <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-400 bg-slate-50/50 border-b border-slate-100">
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Faculty</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Joined</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-5 py-4"><Skeleton className="h-8 rounded" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Search className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">No users found</p>
                  </td>
                </tr>
              ) : filtered.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9 shrink-0">
                        <AvatarFallback className="bg-[#0B5ED7]/10 text-[#0B5ED7] text-xs font-semibold">
                          {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-800">{user.full_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge className={cn('text-xs border-0', ROLE_COLORS[user.role])}>
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-slate-600 text-xs">{user.department ?? '—'}</td>
                  <td className="px-5 py-4 text-slate-600 text-xs">{user.faculty ?? '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={cn('w-2 h-2 rounded-full', user.is_active ? 'bg-green-500' : 'bg-slate-300')} />
                      <span className="text-xs text-slate-600">{user.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem className="gap-2 text-sm cursor-pointer">
                          <Edit className="w-3.5 h-3.5" /> Edit user
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-sm cursor-pointer">
                          <Mail className="w-3.5 h-3.5" /> Send email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-sm text-red-500 cursor-pointer focus:text-red-500 focus:bg-red-50">
                          <Trash2 className="w-3.5 h-3.5" /> Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-50 text-xs text-slate-500">
          <span>Showing {filtered.length} of {users.length} users</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs" disabled>Previous</Button>
            <span className="px-2 py-1 bg-[#0B5ED7] text-white rounded text-xs">1</span>
            <Button variant="outline" size="sm" className="h-7 text-xs" disabled>Next</Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
