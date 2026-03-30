import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './database/data-source';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { TasksModule } from './tasks/tasks.module';
import { TaskLevelsModule } from './task-levels/task-levels.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(AppDataSource.options),
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    TasksModule,
    TaskLevelsModule,
  ],
})
export class AppModule {}
