import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TaskLevelsService } from './task-levels.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('TaskLevels')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('task-levels')
export class TaskLevelsController {
  constructor(private readonly svc: TaskLevelsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a task level (any authenticated user)' })
  create(
    @CurrentUser() user: User,
    @Body('title') title: string,
    @Body('timeMultiplier') timeMultiplier?: number,
  ) {
    return this.svc.create(user.id, title, timeMultiplier);
  }

  @Get()
  @ApiOperation({ summary: 'Get task levels visible to the current user' })
  findAll(@CurrentUser() user: User) {
    const isAdmin = user.roles?.some((r) => r.name === 'ADMIN');
    return this.svc.findAll(user.id, isAdmin);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task level by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task level (owner or admin)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body('title') title: string,
    @Body('timeMultiplier') timeMultiplier?: number,
  ) {
    const isAdmin = user.roles?.some((r) => r.name === 'ADMIN');
    return this.svc.update(id, user.id, isAdmin, title, timeMultiplier);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task level (owner or admin)' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    const isAdmin = user.roles?.some((r) => r.name === 'ADMIN');
    return this.svc.remove(id, user.id, isAdmin);
  }
}
