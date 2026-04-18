import 'dotenv/config'; // load .env for CLI commands (migration:run, seed, etc.)
import { DataSource } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';

// This file is used ONLY by the TypeORM CLI (migrations, seeds).
// The app itself uses TypeOrmModule.forRootAsync() in app.module.ts.
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'task_management',

  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  seeds: ['src/database/seeds/**/*{.ts,.js}'],
  synchronize: false,
} as any & SeederOptions);
