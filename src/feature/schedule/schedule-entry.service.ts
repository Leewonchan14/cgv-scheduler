import { Employee } from '@/entity/employee.entity';
import { DateDay } from '@/entity/interface/DateDay';
import {
  ScheduleEntry as IScheduleEntry,
  ScheduleEntry,
} from '@/entity/schedule-entry.entity';
import { ISchedule, ScheduleSchema } from '@/entity/types';
import {
  addDays,
  endOfMonth,
  format,
  getDaysInMonth,
  startOfMonth,
} from 'date-fns';
import _ from 'lodash';
import { Between, DataSource, DeepPartial, Repository } from 'typeorm';

export class ScheduleEntryService implements IScheduleEntryService {
  private employeeRep: Repository<Employee>;
  private scheduleRep: Repository<IScheduleEntry>;
  static getInstance(appDataSource: DataSource): ScheduleEntryService {
    return new ScheduleEntryService(appDataSource);
  }

  constructor(appDataSource: DataSource) {
    this.scheduleRep = appDataSource.getRepository(IScheduleEntry);
    this.employeeRep = appDataSource.getRepository(Employee);
  }

  save(scheduleEntry: DeepPartial<ScheduleEntry>): Promise<IScheduleEntry> {
    return this.scheduleRep.save(
      this.scheduleRep.create(_.omit(scheduleEntry, 'id')),
    );
  }

  async saveWeek(
    scheduleEntries: DeepPartial<ScheduleEntry>[],
    employees: Employee[],
  ): Promise<void> {
    const mapper = scheduleEntries.map((e) => {
      const entry = this.scheduleRep.create(e);
      entry.employee = employees.find((emp) => emp.id === e.employee!.id)!;

      return entry;
    });
    await this.scheduleRep.upsert(mapper, ['id']);
  }

  async remove(id: number): Promise<void> {
    await this.scheduleRep.delete(id);
  }

  // start와 end 사이의 스케쥴의 갯수를 가져온다.
  async findByDate(selectDate: Date): Promise<number[]> {
    const startDate = startOfMonth(selectDate);
    const endDate = endOfMonth(selectDate);
    const entries = await this.scheduleRep.find({
      where: {
        date: Between(startDate, endDate),
      },
      order: {
        date: 'ASC',
      },
    });

    const kDate = _.chain(entries)
      .groupBy((e) => format(e.date, 'yyyy-MM-dd'))
      .mapValues((e) => _.size(e))
      .value();

    return _.range(getDaysInMonth(selectDate)).map(
      (i) => kDate[format(addDays(startDate, i), 'yyyy-MM-dd')] ?? 0,
    );
  }

  async findWeekSchedule(startDate: Date): Promise<ISchedule> {
    const start = format(startDate, 'yyyy-MM-dd');
    const end = format(new DateDay(startDate, 6).date, 'yyyy-MM-dd');

    const scheduleEntries = await this.scheduleRep.find({
      where: {
        date: Between(new Date(start), new Date(end)),
      },
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
