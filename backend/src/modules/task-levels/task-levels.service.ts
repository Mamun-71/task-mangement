import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Or, Repository } from 'typeorm';
import { TaskLevel } from './entities/task-level.entity';

@Injectable()
export class TaskLevelsService {
  constructor(
    @InjectRepository(TaskLevel)
    private repo: Repository<TaskLevel>,
  ) {}

  create(userId: number, title: string, timeMultiplier = 1.0) {
    const level = this.repo.create({ title, timeMultiplier, userId });
    return this.repo.save(level);
  }

  findAll(userId: number, isAdmin: boolean) {
    if (isAdmin) {
      // Admins see every level (global + all users')
      return this.repo.find({ order: { id: 'ASC' }, relations: ['user'] });
    }
    // Regular users see their own levels + global (userId = null) levels
    return this.repo.find({
      where: [{ userId }, { userId: IsNull() }],
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const level = await this.repo.findOne({ where: { id } });
    if (!level) throw new NotFoundException('TaskLevel not found');
    return level;
  }

  async update(id: number, userId: number, isAdmin: boolean, title: string, timeMultiplier?: number) {
    const level = await this.findOne(id);
    // Only the owner or an admin can update
    if (!isAdmin && level.userId !== userId) {
      throw new ForbiddenException('You can only edit your own task levels');
    }
    if (title) level.title = title;
    if (timeMultiplier !== undefined) level.timeMultiplier = timeMultiplier;
    return this.repo.save(level);
  }

  async remove(id: number, userId: number, isAdmin: boolean) {
    const level = await this.findOne(id);
    if (!isAdmin && level.userId !== userId) {
      throw new ForbiddenException('You can only delete your own task levels');
    }
    return this.repo.remove(level);
  }
}
