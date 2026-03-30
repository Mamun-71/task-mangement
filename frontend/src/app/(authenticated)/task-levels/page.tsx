'use client';

import { useEffect, useState } from 'react';
import { taskLevelsService } from '@/lib/api-services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/store/useAuthStore';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TaskLevelsPage() {
  const [levels, setLevels] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const { user } = useAuthStore();
  const isAdmin = user?.roles?.some((role) => role.name === 'ADMIN');

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      const { data } = await taskLevelsService.getAll();
      setLevels(data);
    } catch (error) {
      toast.error('Failed to fetch task levels');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await taskLevelsService.create({ title: newTitle });
      toast.success('Task Level created');
      setNewTitle('');
      fetchLevels();
    } catch (error) {
      toast.error('Failed to create level');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this level?')) return;
    try {
      await taskLevelsService.delete(id);
      setLevels((prev) => prev.filter((l) => l.id !== id));
      toast.success('Deleted successfully');
    } catch (error) {
      toast.error('Failed to delete level');
    }
  };

  if (!isAdmin) {
    return <div className="p-8"><p>Unauthorized. Admins only.</p></div>;
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Task Levels</h1>

      <form onSubmit={handleCreate} className="flex space-x-2">
        <Input 
          value={newTitle} 
          onChange={(e) => setNewTitle(e.target.value)} 
          placeholder="New level title" 
          className="max-w-xs" 
        />
        <Button type="submit">Add Level</Button>
      </form>

      <div className="bg-white rounded-md shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {levels.map((level) => (
              <TableRow key={level.id}>
                <TableCell>{level.id}</TableCell>
                <TableCell className="font-medium">{level.title}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(level.id)} className="text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
