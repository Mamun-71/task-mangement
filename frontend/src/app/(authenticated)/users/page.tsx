'use client';
import { useEffect, useState } from 'react';
import { usersService, rolesService } from '@/lib/api-services';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Trash2, ShieldCheck, Users, Mail, Search,
  MoreVertical, ChevronDown, UserCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Role { id: number; name: string; }
interface UserItem {
  id: number;
  name: string;
  email: string;
  provider: string;
  roles: Role[];
}

const PROVIDER_LABEL: Record<string, string> = {
  local: 'Email',
  google: 'Google',
};

function UserAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = [
    'bg-indigo-500', 'bg-violet-500', 'bg-teal-500', 'bg-orange-500', 'bg-emerald-500',
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`w-9 h-9 rounded-full ${color} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>
      {initials}
    </div>
  );
}

function RoleAssignModal({
  user,
  allRoles,
  onClose,
  onSave,
}: {
  user: UserItem;
  allRoles: Role[];
  onClose: () => void;
  onSave: (userId: number, roleIds: number[]) => void;
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set(user.roles.map((r) => r.id)));

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
        <div className="flex items-center gap-3 mb-5">
          <UserAvatar name={user.name} />
          <div>
            <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          Assign Roles
        </h3>
        <div className="space-y-2">
          {allRoles.map((role) => (
            <label
              key={role.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selected.has(role.id)}
                onChange={() => toggle(role.id)}
                className="w-4 h-4 rounded accent-indigo-600"
              />
              <span className="text-sm font-medium text-gray-700">{role.name}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2 mt-5">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => { onSave(user.id, [...selected]); onClose(); }}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState('');
  const [assignTarget, setAssignTarget] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { user: me, hasRole } = useAuthStore();
  const isAdmin = hasRole('ADMIN');

  useEffect(() => {
    if (isAdmin) fetchAll();
  }, [isAdmin]);

  const fetchAll = async () => {
    try {
      const [u, r] = await Promise.all([usersService.getAll(), rolesService.getAll()]);
      setUsers(u.data ?? []);
      setAllRoles(r.data ?? []);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (id === me?.id) { toast.error("You can't delete yourself"); return; }
    if (!confirm('Delete this user? This is irreversible.')) return;
    try {
      await usersService.delete(id);
      setUsers((p) => p.filter((u) => u.id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleAssignRoles = async (userId: number, roleIds: number[]) => {
    try {
      const { data } = await usersService.assignRoles(userId, roleIds);
      setUsers((p) => p.map((u) => u.id === userId ? { ...u, roles: data.roles ?? [] } : u));
      toast.success('Roles updated');
    } catch { toast.error('Failed to update roles'); }
  };

  if (!isAdmin) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64">
        <ShieldCheck className="w-12 h-12 text-gray-200 mb-3" />
        <p className="text-gray-500 font-medium">Admin access required</p>
      </div>
    );
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-400 mt-0.5">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Admins', value: users.filter((u) => u.roles.some((r) => r.name === 'ADMIN')).length, icon: ShieldCheck, color: 'text-rose-600 bg-rose-50' },
          { label: 'Google OAuth', value: users.filter((u) => u.provider === 'google').length, icon: UserCircle2, color: 'text-teal-600 bg-teal-50' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-100 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition"
        />
      </div>

      {/* User list */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-gray-50 bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide">
          <span>User</span>
          <span>Email</span>
          <span>Provider</span>
          <span>Roles</span>
          <span />
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No users found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((u) => (
              <div
                key={u.id}
                className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center hover:bg-gray-50/50 transition-colors group"
              >
                {/* Name */}
                <div className="flex items-center gap-3">
                  <UserAvatar name={u.name} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                    {u.id === me?.id && (
                      <span className="text-xs text-indigo-500 font-medium">You</span>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-1.5 text-sm text-gray-500 truncate">
                  <Mail className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                  <span className="truncate">{u.email}</span>
                </div>

                {/* Provider */}
                <span className={`text-xs px-2 py-1 rounded-full font-medium w-fit ${
                  u.provider === 'google'
                    ? 'bg-teal-50 text-teal-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {PROVIDER_LABEL[u.provider] ?? u.provider}
                </span>

                {/* Roles */}
                <div className="flex flex-wrap gap-1">
                  {u.roles?.length > 0
                    ? u.roles.map((r) => (
                        <Badge
                          key={r.id}
                          className={`text-xs px-2 py-0.5 border-0 rounded-full ${
                            r.name === 'ADMIN'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-indigo-50 text-indigo-600'
                          }`}
                        >
                          {r.name}
                        </Badge>
                      ))
                    : <span className="text-xs text-gray-300">—</span>}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setAssignTarget(u)}
                    title="Manage roles"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                  {u.id !== me?.id && (
                    <button
                      onClick={() => handleDelete(u.id)}
                      title="Delete user"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role assignment modal */}
      {assignTarget && (
        <RoleAssignModal
          user={assignTarget}
          allRoles={allRoles}
          onClose={() => setAssignTarget(null)}
          onSave={handleAssignRoles}
        />
      )}
    </div>
  );
}
