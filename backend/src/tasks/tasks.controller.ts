import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TasksService, TaskFilters } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TaskStatus } from './entities/task.entity';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  create(@CurrentUser() user, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(user.id, createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks for current user (Admins get all)' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'taskLevelId', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @CurrentUser() user,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('taskLevelId') taskLevelId?: string,
    @Query('status') status?: TaskStatus,
  ) {
    const isAdmin = user.roles?.some(role => role.name === 'ADMIN');
    const filters: TaskFilters = {
      startDate,
      endDate,
      taskLevelId: taskLevelId ? parseInt(taskLevelId) : undefined,
      status,
    };
    return this.tasksService.findAll(user.id, isAdmin, filters);
  }

  @Get('analytics/:period')
  @ApiOperation({ summary: 'Get task analytics (weekly or monthly)' })
  getAnalytics(
    @Param('period') period: 'weekly' | 'monthly',
    @CurrentUser() user
  ) {
    const isAdmin = user.roles?.some(role => role.name === 'ADMIN');
    return this.tasksService.getAnalytics(user.id, isAdmin, period);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by id' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user) {
    const isAdmin = user.roles?.some(role => role.name === 'ADMIN');
    return this.tasksService.findOne(id, user.id, isAdmin);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update a task status' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: TaskStatus,
    @CurrentUser() user
  ) {
    const isAdmin = user.roles?.some(role => role.name === 'ADMIN');
    return this.tasksService.updateStatus(id, user.id, isAdmin, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user) {
    const isAdmin = user.roles?.some(role => role.name === 'ADMIN');
    return this.tasksService.remove(id, user.id, isAdmin);
  }
}
