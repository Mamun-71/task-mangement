'use client';
import { useEffect, useState } from 'react';
import { taskLevelsService } from '@/lib/api-services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/useAuthStore';
import { Trash2, Plus, Layers, Globe, User2, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface TaskLevel {
  id: number;
  title: string;
  timeMultiplier: number;
  userId: number | null;
  user?: { id: number; name: string } | null;
}

export default function TaskLevelsPage() {
  const [levels, setLevels] = useState<TaskLevel[]>([]);
  const [title, setTitle] = useState('');
  const [multiplier, setMultiplier] = useState('1.0');
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMult, setEditMult] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, hasRole } = useAuthStore();
  const isAdmin = hasRole('ADMIN');

  const fetchLevels = async () => {
    try {
      const { data } = await taskLevelsService.getAll();
      setLevels(data ?? []);
    } catch { toast.error('Failed to load levels'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLevels(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await taskLevelsService.create({ title: title.trim(), timeMultiplier: parseFloat(multiplier) || 1.0 });
      toast.success('Level created');
      setTitle('');
      setMultiplier('1.0');
      fetchLevels();
    } catch { toast.error('Failed to create level'); }
  };

  const startEdit = (l: TaskLevel) => {
    setEditId(l.id);
    setEditTitle(l.title);
    setEditMult(String(l.timeMultiplier));
  };

  const saveEdit = async (id: number) => {
    try {
      await taskLevelsService.update(id, { title: editTitle, timeMultiplier: parseFloat(editMult) || 1.0 });
      toast.success('Updated');
      setEditId(null);
      fetchLevels();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this level? Tasks using it will be unaffected.')) return;
    try {
      await taskLevelsService.delete(id);
      setLevels((p) => p.filter((l) => l.id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const canEdit = (level: TaskLevel) => isAdmin || level.userId === user?.id;

  const globalLevels = levels.filter((l) => l.userId === null);
  const myLevels = levels.filter((l) => l.userId !== null);

  const LevelRow = ({ level }: { level: TaskLevel }) => (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/60 transition-colors group">
      {editId === level.id ? (
        <>
          <div className="flex-1 flex items-center gap-2">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="h-8 text-sm max-w-48"
              autoFocus
            />
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400">×</span>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                value={editMult}
                onChange={(e) => setEditMult(e.target.value)}
                className="h-8 text-sm w-20"
              />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => saveEdit(level.id)} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setEditId(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-900">{level.title}</span>
            {level.userId && level.user && isAdmin && (
              <span className="ml-2 text-xs text-gray-400">by {level.user.name}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono font-semibold">
              ×{Number(level.timeMultiplier).toFixed(1)}
            </span>
          </div>
          {canEdit(level) && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => startEdit(level)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(level.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Task Levels</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Define difficulty levels with time multipliers. Levels are personal — only you see yours.
        </p>
      </div>

      {/* Create form */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-500" />
          Create New Level
        </h2>
        <form onSubmit={handleCreate} className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Level Name</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sprint, Deep Work, Admin…"
              className="h-9 text-sm"
            />
          </div>
          <div className="w-32">
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
              Multiplier
              <span className="ml-1 text-gray-300 font-normal">(time ×)</span>
            </label>
            <Input
              type="number"
              step="0.1"
              min="0.1"
              max="10"
              value={multiplier}
              onChange={(e) => setMultiplier(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <Button
            type="submit"
            disabled={!title.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white h-9"
          >
            Add
          </Button>
        </form>
        <p className="text-xs text-gray-400 mt-3">
          A multiplier of 1.5 means 1 hour of this task counts as 1.5 hours adjusted.
        </p>
      </div>

      {/* My levels */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50 bg-gray-50">
          <User2 className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-gray-700">My Levels</h2>
          <span className="ml-auto text-xs text-gray-400">{myLevels.length} level{myLevels.length !== 1 ? 's' : ''}</span>
        </div>
        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
          </div>
        ) : myLevels.length === 0 ? (
          <div className="py-10 text-center">
            <Layers className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No personal levels yet. Create one above.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {myLevels.map((l) => <LevelRow key={l.id} level={l} />)}
          </div>
        )}
      </div>

      {/* Global levels */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50 bg-gray-50">
          <Globe className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Global Levels</h2>
          <span className="ml-auto text-xs text-gray-400">Visible to all users · {isAdmin ? 'editable by admin' : 'read-only'}</span>
        </div>
        {globalLevels.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">No global levels.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {globalLevels.map((l) => <LevelRow key={l.id} level={l} />)}
          </div>
        )}
      </div>
    </div>
  );
}
