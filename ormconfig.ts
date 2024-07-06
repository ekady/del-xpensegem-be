import { configDotenv } from 'dotenv';
import { DataSource } from 'typeorm';

import { SnakeNamingStrategy } from './src/shared/strategies/snake-naming.strategy';

configDotenv();

export const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  namingStrategy: new SnakeNamingStrategy(),
  subscribers: ['./src/modules/**/*.subscriber{.ts,.js}'],
  entities: [
    './src/modules/**/*.entity{.ts,.js}',
    './src/modules/**/*.view-entity{.ts,.js}',
  ],
  migrations: ['./src/common/database/migrations/*{.ts,.js}'],
});
