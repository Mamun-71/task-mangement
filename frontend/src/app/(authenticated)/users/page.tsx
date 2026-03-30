'use client';

import { useEffect, useState } from 'react';
import { usersService } from '@/lib/api-services';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function UsersPage() {
  const [usersList, setUsersList] = useState<any[]>([]);
  const { user } = useAuthStore();
  const isAdmin = user?.roles?.some((role) => role.name === 'ADMIN');

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data } = await usersService.getAll();
      setUsersList(data);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const handleDelete = async (id: number) => {
    if (id === user?.id) {
      toast.error('You cannot delete yourself!');
      return;
    }
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await usersService.delete(id);
      setUsersList((prev) => prev.filter((u) => u.id !== id));
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  if (!isAdmin) {
    return <div className="p-8"><p>Unauthorized. Admins only.</p></div>;
  }

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold">Users Management</h1>

      <div className="bg-white rounded-md shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersList.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.provider}</TableCell>
                <TableCell className="space-x-1">
                  {u.roles?.map((role: any) => (
                    <Badge key={role.id} variant={role.name === 'ADMIN' ? 'destructive' : 'secondary'}>
                      {role.name}
                    </Badge>
                  ))}
                  {(!u.roles || u.roles.length === 0) && <span className="text-xs text-gray-500">None</span>}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)} className="text-red-500">
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
