import { Employee } from '@/entity/employee.entity';
import { ScheduleEntry } from '@/entity/schedule-entry.entity';
import { Schedule } from '@/entity/schedule.entity';
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  entities: [Employee, Schedule, ScheduleEntry],
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
