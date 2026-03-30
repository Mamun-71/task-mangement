import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TaskLevelsService } from './task-levels.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('TaskLevels')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('task-levels')
export class TaskLevelsController {
  constructor(private readonly taskLevelsService: TaskLevelsService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a task level (ADMIN only)' })
  create(@Body('title') title: string) {
    return this.taskLevelsService.create(title);
  }

  @Get()
  @ApiOperation({ summary: 'Get all task levels' })
  findAll() {
    return this.taskLevelsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task level by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.taskLevelsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a task level (ADMIN only)' })
  update(@Param('id', ParseIntPipe) id: number, @Body('title') title: string) {
    return this.taskLevelsService.update(id, title);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a task level (ADMIN only)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.taskLevelsService.remove(id);
  }
}
