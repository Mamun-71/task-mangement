'use client';

import { useEffect, useState } from 'react';
import { tasksService, taskLevelsService, TaskFilters } from '@/lib/api-services';
import { TaskForm } from '@/components/TaskForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/store/useAuthStore';
import { Trash2, Filter, X, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskLevels, setTaskLevels] = useState<any[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuthStore();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  const isAdmin = user?.roles?.some((role) => role.name === 'ADMIN');

  const fetchTasksAndLevels = async () => {
    try {
      const [tasksRes, levelsRes] = await Promise.all([
        tasksService.getAll(filters),
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
  }, [filters]);

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

  const handleFilterChange = (key: keyof TaskFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);

  const formatElapsedTime = (task: any) => {
    if (!task.elapsedMinutes) return '-';
    const hours = Math.floor(task.elapsedMinutes / 60);
    const minutes = task.elapsedMinutes % 60;
    const adjustedHours = Math.floor((task.adjustedMinutes || 0) / 60);
    const adjustedMinutes = (task.adjustedMinutes || 0) % 60;
    
    if (task.adjustedMinutes && task.adjustedMinutes !== task.elapsedMinutes) {
      return `${hours}h ${minutes}m / ${adjustedHours}h ${adjustedMinutes}m`;
    }
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <div className="flex gap-2">
          <Button 
            variant={showFilters ? 'default' : 'outline'} 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button onClick={() => setIsTaskFormOpen(true)}>Create Task</Button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Filter Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input 
                  type="date" 
                  value={filters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input 
                  type="date" 
                  value={filters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Level</label>
                <Select 
                  value={filters.taskLevelId?.toString() || ''}
                  onValueChange={(val) => handleFilterChange('taskLevelId', val || '')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    {taskLevels.map((level) => (
                      <SelectItem key={level.id} value={level.id.toString()}>
                        {level.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={filters.status || ''}
                  onValueChange={(val) => handleFilterChange('status', val || '')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="bg-white rounded-md shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              {isAdmin && <TableHead>User</TableHead>}
              <TableHead>Level</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Elapsed / Adjusted
                </span>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{task.description}</TableCell>
                {isAdmin && <TableCell>{task.user?.name || 'Unknown'}</TableCell>}
                <TableCell>
                  <Badge variant="outline">{task.taskLevel?.title}</Badge>
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(task.date), 'MMM dd, yyyy')}
                  </span>
                </TableCell>
                <TableCell className="text-sm">{task.startTime} - {task.endTime}</TableCell>
                <TableCell>
                  <span className="text-sm font-mono">{formatElapsedTime(task)}</span>
                </TableCell>
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
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(task.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 8 : 7} className="text-center h-24">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Calendar className="h-8 w-8" />
                    <p>No tasks found.</p>
                    {hasActiveFilters && (
                      <Button variant="link" onClick={clearFilters}>
                        Clear filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {tasks.length > 0 && (
        <div className="text-sm text-muted-foreground text-right">
          Showing {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          {hasActiveFilters && ' (filtered)'}
        </div>
      )}

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
