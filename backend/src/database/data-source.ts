import { DataSource } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'task_management',

  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],

  seeds: ['src/database/seeds/**/*{.ts,.js}'], // ✅ add this
  synchronize: false,
} as any & SeederOptions);