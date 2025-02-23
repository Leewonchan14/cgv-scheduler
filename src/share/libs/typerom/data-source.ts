import { Employee } from '@/entity/employee.entity';
import { ScheduleEntry } from '@/entity/schedule-entry.entity';
import { DataSource } from 'typeorm';

const originDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  entities: [Employee, ScheduleEntry],
  synchronize: true,
  logging: ['error'],
  migrations: [],
  ssl: true,
  subscribers: [],
});

export class AppDataSource {
  private static instance: DataSource | null = null;
  public static async getInstance() {
    if (!AppDataSource.instance || !AppDataSource.instance.isInitialized) {
      try {
        await originDataSource.initialize();
      } catch (error) {
        //초기화 실패시 다시 시도 종료
        console.error('AppDataSource.getInstance() error: ', error);
        throw error;
      }
      AppDataSource.instance = originDataSource;
    }

    return AppDataSource.instance;
  }
}

export const appDataSource = AppDataSource.getInstance;
