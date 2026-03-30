import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { Task } from '../tasks/entities/task.entity';
import { TaskLevel } from '../task-levels/entities/task-level.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '', // To be configured by user
  database: 'task_management',
  synchronize: false, // Migrations will handle schema
  logging: true,
  entities: [User, Role, Permission, Task, TaskLevel],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  subscribers: [],
});
