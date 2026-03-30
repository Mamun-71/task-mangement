import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskLevelsService } from './task-levels.service';
import { TaskLevelsController } from './task-levels.controller';
import { TaskLevel } from './entities/task-level.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaskLevel])],
  controllers: [TaskLevelsController],
  providers: [TaskLevelsService],
})
export class TaskLevelsModule {}
