import { AppDataSource } from './data-source';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { User, AuthProvider } from '../users/entities/user.entity';
import { TaskLevel } from '../task-levels/entities/task-level.entity';
import * as bcrypt from 'bcryptjs';

async function seed() {
  await AppDataSource.initialize();
  console.log('Database connected');

  // Create permissions
  const permissionRepo = AppDataSource.getRepository(Permission);
  const permissionsData = ['CREATE_TASK', 'READ_TASK', 'UPDATE_TASK', 'DELETE_TASK'];
  const permissions: Permission[] = [];
  for (const name of permissionsData) {
    let perm = await permissionRepo.findOne({ where: { name } });
    if (!perm) {
      perm = permissionRepo.create({ name });
      await permissionRepo.save(perm);
    }
    permissions.push(perm);
  }
  console.log('Permissions seeded');

  // Create roles
  const roleRepo = AppDataSource.getRepository(Role);
  let adminRole = await roleRepo.findOne({ where: { name: 'ADMIN' }, relations: ['permissions'] });
  if (!adminRole) {
    adminRole = roleRepo.create({ name: 'ADMIN', permissions });
    await roleRepo.save(adminRole);
  }

  let userRole = await roleRepo.findOne({ where: { name: 'USER' }, relations: ['permissions'] });
  if (!userRole) {
    userRole = roleRepo.create({ 
      name: 'USER', 
      permissions: permissions.filter(p => p.name === 'CREATE_TASK' || p.name === 'READ_TASK' || p.name === 'UPDATE_TASK')
    });
    await roleRepo.save(userRole);
  }
  console.log('Roles seeded');

  // Create Admin User
  const userRepo = AppDataSource.getRepository(User);
  let adminUser = await userRepo.findOne({ where: { email: 'admin@tasksystem.com' } });
  if (!adminUser) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    adminUser = userRepo.create({
      name: 'Super Admin',
      email: 'admin@tasksystem.com',
      password: hashedPassword,
      provider: AuthProvider.LOCAL,
      roles: [adminRole]
    });
    await userRepo.save(adminUser);
    console.log('Admin user seeded (admin@tasksystem.com / admin123)');
  }

  // Create Task Levels
  const taskLevelRepo = AppDataSource.getRepository(TaskLevel);
  const levels = ['Beginner', 'Intermediate', 'Expert'];
  for (const title of levels) {
    let level = await taskLevelRepo.findOne({ where: { title } });
    if (!level) {
      level = taskLevelRepo.create({ title });
      await taskLevelRepo.save(level);
    }
  }
  console.log('Task levels seeded');

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error during seeding:', err);
  process.exit(1);
});
