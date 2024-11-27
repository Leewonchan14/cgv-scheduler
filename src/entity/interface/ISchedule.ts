import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { WorkConditionEntry } from '@/entity/types';

export type ISchedule = {
  [k in EDayOfWeek]: WorkConditionEntry[];
};
