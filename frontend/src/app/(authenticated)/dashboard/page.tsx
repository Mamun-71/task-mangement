'use client';
import { useEffect, useState } from 'react';
import { tasksService } from '@/lib/api-services';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  CheckCircle2, Clock, ListTodo, TrendingUp,
  Activity, Calendar, ArrowUpRight, Zap,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface Analytics {
  summary: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    totalMinutes: string;
    adjustedMinutes: string;
    completionRate: number;
  };
  dailyData: { date: string; total: number; completed: number; minutes: number }[];
  levelData: { level: string; total: number; minutes: number }[];
  statusData: { name: string; value: number; color: string }[];
}

const STATUS_COLORS = {
  COMPLETED: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  IN_PROGRESS: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-400' },
  PENDING: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
            {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
          </div>
          <div className={`p-2.5 rounded-xl ${color}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [weeklyAnalytics, setWeeklyAnalytics] = useState<Analytics | null>(null);
  const [monthlyAnalytics, setMonthlyAnalytics] = useState<Analytics | null>(null);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [weekly, monthly, tasks] = await Promise.all([
        tasksService.getAnalytics('weekly'),
        tasksService.getAnalytics('monthly'),
        tasksService.getAll({}),
      ]);
      setWeeklyAnalytics(weekly.data);
      setMonthlyAnalytics(monthly.data);
      // Most recent 5 tasks
      const sorted = [...(tasks.data || [])].sort(
        (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setRecentTasks(sorted.slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const analytics = period === 'weekly' ? weeklyAnalytics : monthlyAnalytics;
  const periodLabel = period === 'weekly' ? 'Last 7 days' : 'Last 30 days';

  const today = format(new Date(), 'EEEE, MMMM d');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 rounded-xl col-span-2" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  const stats = analytics?.summary;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400">{today}</p>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            {(['weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  period === p
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p === 'weekly' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>
          <Link href="/tasks">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              New Task
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ListTodo}
          label="Total Tasks"
          value={stats?.totalTasks ?? 0}
          sub={periodLabel}
          color="bg-indigo-500"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={stats?.completedTasks ?? 0}
          sub={`${stats?.completionRate ?? 0}% rate`}
          color="bg-emerald-500"
        />
        <StatCard
          icon={Clock}
          label="Time Logged"
          value={stats?.totalMinutes ?? '0h 0m'}
          sub="Raw duration"
          color="bg-orange-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Adjusted Time"
          value={stats?.adjustedMinutes ?? '0h 0m'}
          sub="With multipliers"
          color="bg-violet-500"
        />
      </div>

      {/* ── Charts row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart — tasks over time */}
        <Card className="border border-gray-100 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2 px-5 pt-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                Tasks Over Time
              </CardTitle>
              <span className="text-xs text-gray-400">{periodLabel}</span>
            </div>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics?.dailyData ?? []} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}
                  cursor={{ fill: '#f9fafb' }}
                />
                <Bar dataKey="total" name="Created" fill="#e0e7ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 px-4 mt-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-3 rounded bg-indigo-200 inline-block" /> Created
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-3 rounded bg-indigo-500 inline-block" /> Completed
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pie chart — status breakdown */}
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-400" />
              Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={analytics?.statusData ?? []}
                  cx="50%" cy="50%"
                  innerRadius={45} outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {(analytics?.statusData ?? []).map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-2 mt-1">
              {(analytics?.statusData ?? []).map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-gray-600">{s.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent tasks ──────────────────────────────────── */}
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-700">Recent Tasks</CardTitle>
            <Link href="/tasks" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          {recentTasks.length === 0 ? (
            <div className="py-8 text-center">
              <ListTodo className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No tasks yet.</p>
              <Link href="/tasks">
                <Button variant="link" size="sm" className="text-indigo-600 mt-1">Create your first task</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTasks.map((task) => {
                const s = STATUS_COLORS[task.status as keyof typeof STATUS_COLORS] ?? STATUS_COLORS.PENDING;
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{task.description}</p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(task.date), 'MMM d')} · {task.startTime?.slice(0, 5)} – {task.endTime?.slice(0, 5)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {task.taskLevel && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                          {task.taskLevel.title}
                        </span>
                      )}
                      <Badge
                        className={`text-xs px-2 py-0.5 rounded-full border-0 ${s.bg} ${s.text}`}
                      >
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
