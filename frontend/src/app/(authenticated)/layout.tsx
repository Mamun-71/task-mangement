'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isAdmin = user?.roles?.some((role) => role.name === 'ADMIN');

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
              <span className="hidden font-bold sm:inline-block">TaskManager</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/dashboard" className="transition-colors hover:text-foreground/80">Dashboard</Link>
              <Link href="/tasks" className="transition-colors hover:text-foreground/80">Tasks</Link>
              {isAdmin && (
                <>
                  <Link href="/task-levels" className="transition-colors hover:text-foreground/80">Task Levels</Link>
                  <Link href="/users" className="transition-colors hover:text-foreground/80">Users</Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* Add search if needed */}
            </div>
            <nav className="flex items-center space-x-4">
              <span className="text-sm font-medium hidden sm:inline-block">{user?.name}</span>
              <Button onClick={handleLogout} variant="ghost" size="sm">
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  );
}
