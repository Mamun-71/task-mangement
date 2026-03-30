'use client';

import { useEffect, useState } from 'react';
import { tasksService, taskLevelsService } from '@/lib/api-services';
import { TaskForm } from '@/components/TaskForm';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/useAuthStore';
import { Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskLevels, setTaskLevels] = useState<any[]>([]);
  const { user } = useAuthStore();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  const isAdmin = user?.roles?.some((role) => role.name === 'ADMIN');

  const fetchTasksAndLevels = async () => {
    try {
      const [tasksRes, levelsRes] = await Promise.all([
        tasksService.getAll(),
        taskLevelsService.getAll(),
      ]);
      setTasks(tasksRes.data);
      setTaskLevels(levelsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    }
  };

  useEffect(() => {
    fetchTasksAndLevels();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await tasksService.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await tasksService.updateStatus(id, status);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      toast.success('Task status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Button onClick={() => setIsTaskFormOpen(true)}>Create Task</Button>
      </div>

      <div className="bg-white rounded-md shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              {isAdmin && <TableHead>User</TableHead>}
              <TableHead>Level</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.description}</TableCell>
                {isAdmin && <TableCell>{task.user?.name || 'Unknown'}</TableCell>}
                <TableCell>{task.taskLevel?.title}</TableCell>
                <TableCell>{format(new Date(task.date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{task.startTime} - {task.endTime}</TableCell>
                <TableCell>
                  <select 
                    value={task.status} 
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className="border rounded p-1 text-sm bg-transparent"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)} className="text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} className="text-center h-24">
                  No tasks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {isTaskFormOpen && (
        <TaskForm 
          isOpen={isTaskFormOpen} 
          setIsOpen={setIsTaskFormOpen}
          taskLevels={taskLevels}
          onSuccess={fetchTasksAndLevels}
        />
      )}
    </div>
  );
}
