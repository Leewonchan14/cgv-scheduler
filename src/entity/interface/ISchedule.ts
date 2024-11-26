import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { ScheduleEntry } from '@/entity/schedule-entry.entity';

export type ISchedule = {
  [k in EDayOfWeek]: ScheduleEntry[];
};
