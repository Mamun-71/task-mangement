import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';

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

  findAll(userId: number, isAdmin: boolean) {
    // Admins can see all tasks, regular users see only theirs
    if (isAdmin) {
      return this.tasksRepository.find({ relations: ['user', 'taskLevel'] });
    }
    return this.tasksRepository.find({ where: { userId }, relations: ['taskLevel'] });
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
}
