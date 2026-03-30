'use client';

import { useState } from 'react';
import { tasksService } from '@/lib/api-services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export function TaskForm({ isOpen, setIsOpen, taskLevels, onSuccess }: any) {
  const [description, setDescription] = useState('');
  const [taskLevelId, setTaskLevelId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await tasksService.create({
        description,
        taskLevelId: parseInt(taskLevelId),
        date: new Date(date).toISOString().split('T')[0],
        startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
        endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
      });
      toast.success('Task created successfully');
      setIsOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message?.[0] || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Description</Label>
            <Input required value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Task Level</Label>
            <Select onValueChange={(val) => setTaskLevelId((val as string) ?? '')} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a level" />
              </SelectTrigger>
              <SelectContent>
                {taskLevels.map((level: any) => (
                  <SelectItem key={level.id} value={level.id.toString()}>
                    {level.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
