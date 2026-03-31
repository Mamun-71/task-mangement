'use client';

import { useState } from 'react';
import { tasksService } from '@/lib/api-services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface FormErrors {
  description?: string;
  taskLevelId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
}

export function TaskForm({ isOpen, setIsOpen, taskLevels, onSuccess }: any) {
  const [description, setDescription] = useState('');
  const [taskLevelId, setTaskLevelId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 3) {
      newErrors.description = 'Description must be at least 3 characters';
    }

    if (!taskLevelId) {
      newErrors.taskLevelId = 'Please select a task level';
    }

    if (!date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        newErrors.date = 'Date cannot be in the future';
      }
    }

    if (!startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!endTime) {
      newErrors.endTime = 'End time is required';
    } else if (startTime && endTime) {
      if (endTime <= startTime) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await tasksService.create({
        description: description.trim(),
        taskLevelId: parseInt(taskLevelId),
        date: new Date(date).toISOString().split('T')[0],
        startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
        endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
      });
      toast.success('Task created successfully');
      resetForm();
      setIsOpen(false);
      onSuccess();
    } catch (error: any) {
      const message = error.response?.data?.message;
      if (Array.isArray(message)) {
        toast.error(message[0]);
      } else if (message) {
        toast.error(message);
      } else {
        toast.error('Failed to create task. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDescription('');
    setTaskLevelId('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setErrors({});
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new task.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input 
              id="description"
              placeholder="Enter task description" 
              value={description} 
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
              }}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="taskLevel">Task Level *</Label>
            <Select 
              onValueChange={(val) => {
                setTaskLevelId(val || '');
                if (errors.taskLevelId) setErrors(prev => ({ ...prev, taskLevelId: undefined }));
              }}
              value={taskLevelId}
            >
              <SelectTrigger id="taskLevel" className={errors.taskLevelId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a level" />
              </SelectTrigger>
              <SelectContent>
                {taskLevels.map((level: any) => (
                  <SelectItem key={level.id} value={level.id.toString()}>
                    {level.title} {level.timeMultiplier && `(${level.timeMultiplier}x)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.taskLevelId && (
              <p className="text-sm text-red-500">{errors.taskLevelId}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input 
              id="date"
              type="date" 
              value={date} 
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) setErrors(prev => ({ ...prev, date: undefined }));
              }}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input 
                id="startTime"
                type="time" 
                value={startTime} 
                onChange={(e) => {
                  setStartTime(e.target.value);
                  if (errors.startTime) setErrors(prev => ({ ...prev, startTime: undefined }));
                  if (errors.endTime && e.target.value) setErrors(prev => ({ ...prev, endTime: undefined }));
                }}
                className={errors.startTime ? 'border-red-500' : ''}
              />
              {errors.startTime && (
                <p className="text-sm text-red-500">{errors.startTime}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input 
                id="endTime"
                type="time" 
                value={endTime} 
                onChange={(e) => {
                  setEndTime(e.target.value);
                  if (errors.endTime) setErrors(prev => ({ ...prev, endTime: undefined }));
                }}
                className={errors.endTime ? 'border-red-500' : ''}
              />
              {errors.endTime && (
                <p className="text-sm text-red-500">{errors.endTime}</p>
              )}
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
