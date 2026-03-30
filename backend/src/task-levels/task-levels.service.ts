import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskLevel } from './entities/task-level.entity';

@Injectable()
export class TaskLevelsService {
  constructor(
    @InjectRepository(TaskLevel)
    private taskLevelsRepository: Repository<TaskLevel>,
  ) {}

  create(title: string) {
    const taskLevel = this.taskLevelsRepository.create({ title });
    return this.taskLevelsRepository.save(taskLevel);
  }

  findAll() {
    return this.taskLevelsRepository.find();
  }

  async findOne(id: number) {
    const taskLevel = await this.taskLevelsRepository.findOne({ where: { id } });
    if (!taskLevel) throw new NotFoundException('TaskLevel not found');
    return taskLevel;
  }

  async update(id: number, title: string) {
    const taskLevel = await this.findOne(id);
    taskLevel.title = title;
    return this.taskLevelsRepository.save(taskLevel);
  }

  remove(id: number) {
    return this.taskLevelsRepository.delete(id);
  }
}
