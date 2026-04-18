'use client';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import {
  CheckCircle2,
  Clock,
  BarChart3,
  Layers,
  ArrowRight,
  Zap,
  Shield,
  Users,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const FEATURES = [
  {
    icon: CheckCircle2,
    title: 'Task Tracking',
    desc: 'Create, organise, and track daily tasks with statuses. Never lose track of what matters.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Clock,
    title: 'Time Logging',
    desc: 'Log start and end times per task. Automatically calculates elapsed and adjusted time.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    desc: 'Weekly and monthly dashboards show completion rates, time spent, and productivity trends.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: Layers,
    title: 'Custom Levels',
    desc: 'Define your own task difficulty levels with time multipliers to weight your effort fairly.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    desc: 'Admin and user roles control who can see and manage what. Secure by default.',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    icon: Users,
    title: 'Team Ready',
    desc: 'Admins get a full user management panel. Assign roles, view all tasks, and monitor the team.',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
];

const STATS = [
  { value: '100%', label: 'Free & Open Source' },
  { value: '< 1s', label: 'Page Load Time' },
  { value: '3', label: 'Task Statuses' },
  { value: '∞', label: 'Task Levels' },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">TaskFlow</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Go to Dashboard <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Get started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-24 pb-20 bg-gradient-to-b from-indigo-50/60 via-white to-white">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-semibold text-indigo-700 mb-6">
          <Zap className="w-3 h-3" />
          Lightweight daily task management
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight max-w-3xl">
          Your work,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
            organised
          </span>
        </h1>

        <p className="mt-5 text-lg text-gray-500 max-w-xl leading-relaxed">
          TaskFlow is a focused, no-bloat daily task manager. Log tasks, track time,
          and understand your productivity — all in one clean workspace.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 shadow-lg shadow-indigo-200">
                Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/signup">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 shadow-lg shadow-indigo-200">
                  Start for free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="px-8 border-gray-200 text-gray-700">
                  Sign in
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mini preview card */}
        <div className="mt-16 w-full max-w-2xl rounded-2xl border border-gray-200 shadow-xl shadow-gray-100 overflow-hidden bg-white text-left">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-100 bg-gray-50">
            {['bg-red-400','bg-yellow-400','bg-green-400'].map((c) => (
              <span key={c} className={`w-2.5 h-2.5 rounded-full ${c}`} />
            ))}
            <span className="ml-2 text-xs text-gray-400 font-medium">TaskFlow — Dashboard</span>
          </div>
          <div className="p-5 grid grid-cols-4 gap-3">
            {[
              { label: 'Total Tasks', val: '24', color: 'bg-blue-50 text-blue-700' },
              { label: 'Completed', val: '18', color: 'bg-emerald-50 text-emerald-700' },
              { label: 'In Progress', val: '4', color: 'bg-yellow-50 text-yellow-700' },
              { label: 'Pending', val: '2', color: 'bg-gray-50 text-gray-600' },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl p-3 ${s.color}`}>
                <div className="text-2xl font-bold">{s.val}</div>
                <div className="text-xs mt-0.5 opacity-70">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="px-5 pb-5">
            <div className="h-20 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-indigo-300" />
              <span className="ml-2 text-sm text-indigo-400 font-medium">Weekly analytics chart</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────── */}
      <section className="border-y border-gray-100 py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need</h2>
            <p className="mt-3 text-gray-500 text-base max-w-md mx-auto">
              Built to cover the full daily task workflow — from creation to analytics.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl border border-gray-100 bg-white hover:border-indigo-100 hover:shadow-md transition-all duration-200"
              >
                <div className={`inline-flex p-2.5 rounded-xl ${f.bg} mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-indigo-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white">Ready to stay organised?</h2>
          <p className="mt-3 text-indigo-200 text-base">
            Create your free account and start logging tasks today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="px-8">
                  Open Dashboard <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="px-8">
                    Create free account
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="px-8 border-indigo-400 text-white hover:bg-indigo-700 hover:text-white">
                    Sign in
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="py-8 px-4 border-t border-gray-100 text-center text-sm text-gray-400">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-gray-600">TaskFlow</span>
        </div>
        <p>Lightweight daily task management &mdash; built for focus.</p>
      </footer>
    </div>
  );
}
