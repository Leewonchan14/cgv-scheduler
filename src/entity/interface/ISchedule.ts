import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { ScheduleEntry } from '@/entity/schedule-entry.entity';
import { WorkConditionEntry } from '@/entity/types';

export type ISchedule = {
  [k in EDayOfWeek]: WorkConditionEntry[];
};
