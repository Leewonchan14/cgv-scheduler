import { DateDay } from '@/entity/interface/DateDay';
import {
  ScheduleEntry as IScheduleEntry,
  ScheduleEntry,
} from '@/entity/schedule-entry.entity';
import { ISchedule, ScheduleSchema } from '@/entity/types';
import { format } from 'date-fns';
import _ from 'lodash';
import { Between, DataSource, DeepPartial, Repository } from 'typeorm';

export class ScheduleEntryService implements IScheduleEntryService {
  private scheduleRep: Repository<IScheduleEntry>;
  static async getInstance(
    appDataSource: DataSource,
  ): Promise<ScheduleEntryService> {
    return new ScheduleEntryService(appDataSource);
  }

  constructor(appDataSource: DataSource) {
    this.scheduleRep = appDataSource.getRepository(IScheduleEntry);
  }

  save(scheduleEntry: DeepPartial<ScheduleEntry>): Promise<IScheduleEntry> {
    return this.scheduleRep.save(
      this.scheduleRep.create(_.omit(scheduleEntry, 'id')),
    );
  }

  async saveWeek(scheduleEntries: DeepPartial<ScheduleEntry>[]): Promise<void> {
    await this.scheduleRep.insert(
      scheduleEntries.map((e) => this.scheduleRep.create(_.omit(e, 'id'))),
    );
  }

  async remove(id: number): Promise<void> {
    await this.scheduleRep.delete(id);
  }

  async findWeekSchedule(startDate: Date): Promise<ISchedule> {
    const start = format(startDate, 'yyyy-MM-dd');
    const end = format(new DateDay(startDate, 6).date, 'yyyy-MM-dd');

    const scheduleEntries = await this.scheduleRep.find({
      where: {
        date: Between(new Date(start), new Date(end)),
      },
      take: 7,
    });

    return ScheduleSchema.parse(
      _.groupBy(scheduleEntries, (e) => new DateDay(e.date, 0).getDayOfWeek()),
    );
  }

  async findPreviousSchedule(
    date: Date,
    cnt: number,
  ): Promise<IScheduleEntry[][]> {
    const end = format(new DateDay(date, -1).date, 'yyyy-MM-dd');
    const start = format(new DateDay(date, -cnt).date, 'yyyy-MM-dd');
    const rt = await this.scheduleRep.find({
      where: {
        date: Between(new Date(start), new Date(end)),
      },
    });

    return _.chain(rt)
      .groupBy((e) => format(e.date, 'yyyy-MM-dd'))
      .entries()
      .sortBy(([key]) => key)
      .reverse()
      .map(([_, value]) => value)
      .value();
  }
}

export interface IScheduleEntryService {
  // 주어질 날짜보다 더 이른 날짜의 스케쥴을 n 개 가져온다. (늦은 날짜부터 빠른 날짜 순서로)
  findPreviousSchedule(date: Date, cnt: number): Promise<IScheduleEntry[][]>;
}

export const scheduleEntryService = ScheduleEntryService.getInstance;
