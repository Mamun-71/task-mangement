import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TaskLevelsModule } from './modules/task-levels/task-levels.module';

@Module({
  imports: [
    // ── 1. Load env vars globally before everything else ──────────────
    // isGlobal: true means every module can inject ConfigService without
    // importing ConfigModule again. envFilePath loads .env from project root.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ── 2. Database connection driven by env vars ─────────────────────
    // useFactory lets us inject ConfigService so we can read .env values.
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_DATABASE', 'task_management'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    TasksModule,
    TaskLevelsModule,
  ],
})
export class AppModule {}
