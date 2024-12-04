import { DateDay } from '@/entity/interface/DateDay';
import {
  ScheduleEntry as IScheduleEntry,
  ScheduleEntry,
} from '@/entity/schedule-entry.entity';
import { ISchedule, ScheduleSchema, WorkConditionEntry } from '@/entity/types';
import { EmployeeService } from '@/feature/employee/employee.service';
import {
  addDays,
  differenceInDays,
  endOfMonth,
  format,
  getDaysInMonth,
  startOfMonth,
} from 'date-fns';
import _ from 'lodash';
import { Between, DataSource, DeepPartial, Repository } from 'typeorm';

export class ScheduleEntryService {
  private scheduleRep: Repository<IScheduleEntry>;
  static getInstance(appDataSource: DataSource): ScheduleEntryService {
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

  async saveWeek(
    scheduleEntries: DeepPartial<ScheduleEntry>[],
    employeeService: EmployeeService,
  ): Promise<void> {
    const ids = _.compact(scheduleEntries.map((e) => e.employee?.id));
    const employees = await employeeService.findByIds(ids);

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
  ): Promise<WorkConditionEntry[][]> {
    const startDate = new Date(addDays(date, -cnt));
    const endDate = new Date(addDays(date, -1));

    const rt = await this.scheduleRep.find({
      where: {
        date: Between(startDate, endDate),
      },
      order: {
        date: 'ASC',
      },
    });

    const dicSchedule = _.chain(rt)
      .groupBy((e) => format(e.date, 'yyyy-MM-dd'))
      .value();

    const temp = [] as WorkConditionEntry[][];
    let tempDate = new Date(startDate);

    do {
      const key = format(tempDate, 'yyyy-MM-dd');
      temp.push(dicSchedule[key] ?? []);
      tempDate = addDays(tempDate, 1);
    } while (differenceInDays(endDate, tempDate) >= 0);

    return temp;
  }

  async findNextSchedule(
    date: Date,
    cnt: number,
  ): Promise<WorkConditionEntry[][]> {
    const startDate = new Date(addDays(date, 1));
    const endDate = new Date(addDays(date, cnt));

    const rt = await this.scheduleRep.find({
      where: {
        date: Between(startDate, endDate),
      },
      order: {
        date: 'ASC',
      },
    });

    const dicSchedule = _.chain(rt)
      .groupBy((e) => format(e.date, 'yyyy-MM-dd'))
      .value();

    const temp = [] as WorkConditionEntry[][];
    let tempDate = new Date(startDate);

    do {
      const key = format(tempDate, 'yyyy-MM-dd');
      temp.push(dicSchedule[key] ?? []);
      tempDate = addDays(tempDate, 1);
    } while (differenceInDays(endDate, tempDate) >= 0);

    return temp;
  }
}

export const scheduleEntryService = ScheduleEntryService.getInstance;
