'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { CheckSquare, Square, Plus, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface Task {
  id: string;
  user_id: string;
  title: string;
  is_completed: boolean;
  due_date: string | null;
  created_at: string;
}

export default function TasksPage() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setTasks(data as Task[]);
        setLoading(false);
      });
  }, [profile]);

  async function addTask() {
    if (!newTask.trim() || !profile) return;
    setAdding(true);
    const { data, error } = await supabase
      .from('tasks')
      .insert({ user_id: profile.id, title: newTask.trim(), is_completed: false })
      .select()
      .single();
    if (error) { toast.error('Failed to add task'); }
    else if (data) { setTasks(prev => [data as Task, ...prev]); toast.success('Task added'); }
    setNewTask('');
    setAdding(false);
  }

  async function toggleTask(task: Task) {
    const updated = !task.is_completed;
    await supabase.from('tasks').update({ is_completed: updated }).eq('id', task.id);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_completed: updated } : t));
  }

  async function deleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id);
    setTasks(prev => prev.filter(t => t.id !== id));
    toast.success('Task removed');
  }

  const pending = tasks.filter(t => !t.is_completed);
  const completed = tasks.filter(t => t.is_completed);

  return (
    <DashboardShell
      basePath="/dashboard/student"
      title="My Tasks"
      breadcrumbs={[{ label: 'Student', href: '/dashboard/student' }, { label: 'Tasks' }]}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Add task */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex gap-2">
            <Input
              placeholder="Add a new task..."
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              className="flex-1"
            />
            <Button
              onClick={addTask}
              disabled={adding || !newTask.trim()}
              className="bg-[#0B5ED7] hover:bg-[#0a52c4] gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </div>
        ) : (
          <>
            {/* Pending tasks */}
            {pending.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800 text-sm">Pending</h3>
                  <Badge className="bg-blue-50 text-[#0B5ED7] border-0 text-xs">{pending.length}</Badge>
                </div>
                <div className="divide-y divide-slate-50">
                  {pending.map(task => (
                    <div key={task.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 group">
                      <button onClick={() => toggleTask(task)}>
                        <Square className="w-4 h-4 text-slate-300 hover:text-[#0B5ED7] transition-colors" />
                      </button>
                      <span className="flex-1 text-sm text-slate-700">{task.title}</span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed tasks */}
            {completed.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-500 text-sm">Completed</h3>
                  <Badge className="bg-green-50 text-green-600 border-0 text-xs">{completed.length}</Badge>
                </div>
                <div className="divide-y divide-slate-50">
                  {completed.map(task => (
                    <div key={task.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 group">
                      <button onClick={() => toggleTask(task)}>
                        <CheckSquare className="w-4 h-4 text-[#198754]" />
                      </button>
                      <span className="flex-1 text-sm text-slate-400 line-through">{task.title}</span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tasks.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No tasks yet. Add your first task above.</p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}
