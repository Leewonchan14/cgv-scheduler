import { Employee } from '@/typeorm/entity/employee.entity';
import { WorkType } from '@/typeorm/entity/worktype.entity';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  entities: [Employee, WorkType],
  synchronize: true,
  logging: false,
  migrations: [],
  ssl: true,
  subscribers: [],
});

export const dataSource = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  return AppDataSource;
};
