'use client';

import { useEffect, useState } from 'react';
import { tasksService } from '@/lib/api-services';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchTasks = async () => {
      try {
        const response = await tasksService.getAll();
        setTasks(response.data);
      } catch (error) {
        console.error('Failed to fetch tasks', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
        </div>
      </div>
    );
  }

  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
  const pending = tasks.filter((t) => t.status === 'PENDING').length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
      <p className="text-muted-foreground">Here is an overview of your tasks.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{tasks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending / In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-orange-500">{pending + inProgress}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
