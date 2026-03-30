import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
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
  findAll(@CurrentUser() user) {
    const isAdmin = user.roles?.some(role => role.name === 'ADMIN');
    return this.tasksService.findAll(user.id, isAdmin);
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
