import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';

export interface TaskFilters {
  startDate?: string;
  endDate?: string;
  taskLevelId?: number;
  status?: TaskStatus;
}

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  create(userId: number, createTaskDto: CreateTaskDto) {
    const task = this.tasksRepository.create({
      ...createTaskDto,
      userId,
      status: TaskStatus.PENDING,
    });
    return this.tasksRepository.save(task);
  }

  findAll(userId: number, isAdmin: boolean, filters?: TaskFilters) {
    const where: any = {};
    
    if (!isAdmin) {
      where.userId = userId;
    }

    if (filters) {
      if (filters.startDate && filters.endDate) {
        where.date = Between(filters.startDate, filters.endDate);
      } else if (filters.startDate) {
        where.date = MoreThanOrEqual(filters.startDate);
      } else if (filters.endDate) {
        where.date = LessThanOrEqual(filters.endDate);
      }
      
      if (filters.taskLevelId) {
        where.taskLevelId = filters.taskLevelId;
      }

      if (filters.status) {
        where.status = filters.status;
      }
    }

    const query = this.tasksRepository.find({ 
      where,
      relations: ['user', 'taskLevel'],
      order: { date: 'DESC', startTime: 'DESC' }
    });

    return query;
  }

  async findOne(id: number, userId: number, isAdmin: boolean) {
    const task = await this.tasksRepository.findOne({ where: { id }, relations: ['user', 'taskLevel'] });
    if (!task) throw new NotFoundException('Task not found');
    
    if (!isAdmin && task.userId !== userId) {
      throw new ForbiddenException('You can only access your own tasks');
    }
    return task;
  }

  async updateStatus(id: number, userId: number, isAdmin: boolean, status: TaskStatus) {
    const task = await this.findOne(id, userId, isAdmin);
    task.status = status;
    return this.tasksRepository.save(task);
  }

  async remove(id: number, userId: number, isAdmin: boolean) {
    const task = await this.findOne(id, userId, isAdmin);
    return this.tasksRepository.remove(task);
  }

  async getAnalytics(userId: number, isAdmin: boolean, period: 'weekly' | 'monthly') {
    const now = new Date();
    let startDate: Date;

    if (period === 'weekly') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    }

    const where: any = {
      date: MoreThanOrEqual(startDate.toISOString().split('T')[0]),
    };

    if (!isAdmin) {
      where.userId = userId;
    }

    const tasks = await this.tasksRepository.find({
      where,
      relations: ['taskLevel'],
    });

    const tasksWithCalculatedTime = tasks.map(task => {
      const taskInstance = Object.assign(new Task(), task);
      taskInstance.calculateElapsedTime();
      return taskInstance;
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const pendingTasks = tasks.filter(t => t.status === TaskStatus.PENDING).length;
    const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;

    const totalMinutes = tasksWithCalculatedTime.reduce((sum, t) => sum + (t.elapsedMinutes || 0), 0);
    const adjustedMinutes = tasksWithCalculatedTime.reduce((sum, t) => sum + (t.adjustedMinutes || 0), 0);

    const dailyData = this.groupByDay(tasksWithCalculatedTime, period);
    const levelData = this.groupByLevel(tasksWithCalculatedTime);
    const statusData = [
      { name: 'Completed', value: completedTasks, color: '#22c55e' },
      { name: 'In Progress', value: inProgressTasks, color: '#f59e0b' },
      { name: 'Pending', value: pendingTasks, color: '#6b7280' },
    ];

    return {
      summary: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        totalMinutes: this.formatDuration(totalMinutes),
        adjustedMinutes: this.formatDuration(adjustedMinutes),
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      dailyData,
      levelData,
      statusData,
    };
  }

  private groupByDay(tasks: Task[], period: 'weekly' | 'monthly') {
    const grouped: Record<string, { date: string; total: number; completed: number; minutes: number }> = {};
    
    const days = period === 'weekly' ? 7 : 30;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      grouped[dateStr] = { date: dateStr, total: 0, completed: 0, minutes: 0 };
    }

    tasks.forEach(task => {
      if (grouped[task.date]) {
        grouped[task.date].total++;
        if (task.status === TaskStatus.COMPLETED) {
          grouped[task.date].completed++;
        }
        grouped[task.date].minutes += task.elapsedMinutes || 0;
      }
    });

    return Object.values(grouped).map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  }

  private groupByLevel(tasks: Task[]) {
    const grouped: Record<string, { level: string; total: number; minutes: number }> = {};

    tasks.forEach(task => {
      const level = task.taskLevel?.title || 'Unknown';
      if (!grouped[level]) {
        grouped[level] = { level, total: 0, minutes: 0 };
      }
      grouped[level].total++;
      grouped[level].minutes += task.elapsedMinutes || 0;
    });

    return Object.values(grouped);
  }

  private formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
}
