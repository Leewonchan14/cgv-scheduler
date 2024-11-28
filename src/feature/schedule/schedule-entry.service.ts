import { ScheduleEntry } from '@/entity/schedule-entry.entity';

export interface IScheduleEntryService {
  // 주어질 날짜보다 더 이른 날짜의 스케쥴을 n 개 가져온다. (늦은 날짜부터 빠른 날짜 순서로)
  findPreviousSchedule(date: Date, cnt: number): Promise<ScheduleEntry[][]>;
}
