'use client';
import { useEffect, useState } from 'react';
import { tasksService, taskLevelsService, TaskFilters } from '@/lib/api-services';
import { TaskForm } from '@/components/TaskForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Trash2, Filter, X, Clock, Calendar, Plus,
  ChevronDown, CheckCircle2, Circle, Loader,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const STATUS_META = {
  PENDING: { label: 'Pending', icon: Circle, color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  IN_PROGRESS: { label: 'In Progress', icon: Loader, color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  COMPLETED: { label: 'Completed', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
} as const;

type Status = keyof typeof STATUS_META;

function StatusDropdown({ taskId, current, onUpdate }: { taskId: number; current: Status; onUpdate: (id: number, s: string) => void }) {
  const [open, setOpen] = useState(false);
  const meta = STATUS_META[current];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${meta.color}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
        {meta.label}
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-36">
            {(Object.entries(STATUS_META) as [Status, typeof STATUS_META[Status]][]).map(([val, m]) => (
              <button
                key={val}
                onClick={() => { onUpdate(taskId, val); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors ${val === current ? 'text-indigo-600' : 'text-gray-700'}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                {m.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskLevels, setTaskLevels] = useState<any[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { hasRole } = useAuthStore();
  const isAdmin = hasRole('ADMIN');

  const fetchAll = async () => {
    try {
      const [t, l] = await Promise.all([tasksService.getAll(filters), taskLevelsService.getAll()]);
      setTasks(t.data ?? []);
      setTaskLevels(l.data ?? []);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [filters]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksService.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await tasksService.updateStatus(id, status);
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
      toast.success('Status updated');
    } catch { toast.error('Failed to update'); }
  };

  const setFilter = (key: keyof TaskFilters, val: string) =>
    setFilters((p) => ({ ...p, [key]: val || undefined }));

  const clearFilters = () => setFilters({});
  const hasFilters = Object.values(filters).some(Boolean);

  const formatTime = (task: any) => {
    if (!task.elapsedMinutes) return '—';
    const h = Math.floor(task.elapsedMinutes / 60), m = task.elapsedMinutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {loading ? '...' : `${tasks.length} task${tasks.length !== 1 ? 's' : ''}${hasFilters ? ' (filtered)' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              showFilters || hasFilters
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
          </button>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Task
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">From</label>
              <Input
                type="date"
                value={filters.startDate ?? ''}
                onChange={(e) => setFilter('startDate', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">To</label>
              <Input
                type="date"
                value={filters.endDate ?? ''}
                onChange={(e) => setFilter('endDate', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Level</label>
              <Select
                value={filters.taskLevelId?.toString() ?? 'ALL'}
                onValueChange={(v) => setFilter('taskLevelId', v === 'ALL' ? '' : v as string)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All levels</SelectItem>
                  {taskLevels.map((l) => (
                    <SelectItem key={l.id} value={l.id.toString()}>{l.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Status</label>
              <Select
                value={filters.status ?? 'ALL'}
                onValueChange={(v) => setFilter('status', v === 'ALL' ? '' : v as string)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      )}

      {/* Task list */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Table header */}
        <div className={`grid gap-4 px-5 py-3 border-b border-gray-50 bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide ${isAdmin ? 'grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]' : 'grid-cols-[2fr_1fr_1fr_1fr_auto]'}`}>
          <span>Description</span>
          {isAdmin && <span>User</span>}
          <span>Level</span>
          <span>Date & Time</span>
          <span>Duration</span>
          <span>Status</span>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-16 text-center">
            <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-400">No tasks found</p>
            {hasFilters ? (
              <button onClick={clearFilters} className="mt-2 text-xs text-indigo-600 hover:text-indigo-700">
                Clear filters
              </button>
            ) : (
              <button onClick={() => setIsFormOpen(true)} className="mt-2 text-xs text-indigo-600 hover:text-indigo-700">
                Create your first task
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`grid gap-4 px-5 py-3.5 items-center hover:bg-gray-50/50 transition-colors group ${isAdmin ? 'grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]' : 'grid-cols-[2fr_1fr_1fr_1fr_auto]'}`}
              >
                <p className="text-sm font-medium text-gray-900 truncate">{task.description}</p>
                {isAdmin && (
                  <p className="text-xs text-gray-500 truncate">{task.user?.name ?? '—'}</p>
                )}
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full w-fit">
                  {task.taskLevel?.title ?? '—'}
                </span>
                <div>
                  <p className="text-xs font-medium text-gray-700">
                    {format(new Date(task.date), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {task.startTime?.slice(0, 5)} – {task.endTime?.slice(0, 5)}
                  </p>
                </div>
                <span className="text-xs font-mono text-gray-600">{formatTime(task)}</span>
                <div className="flex items-center gap-2">
                  <StatusDropdown
                    taskId={task.id}
                    current={task.status}
                    onUpdate={handleStatusChange}
                  />
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isFormOpen && (
        <TaskForm
          isOpen={isFormOpen}
          setIsOpen={setIsFormOpen}
          taskLevels={taskLevels}
          onSuccess={fetchAll}
        />
      )}
    </div>
  );
}
