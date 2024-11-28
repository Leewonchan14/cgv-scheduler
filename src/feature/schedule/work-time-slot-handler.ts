import { EWorkTime } from '@/entity/enums/EWorkTime';
import { z } from 'zod';

export class WorkTimeSlot implements IWorkTimeSlot {
  start: string;
  end: string;
  static fromWorkTime(workTime: EWorkTime) {
    switch (workTime) {
      case EWorkTime.오픈:
        return new WorkTimeSlot('8:30', '16:30');
      case EWorkTime.마감:
        return new WorkTimeSlot('16:30', '24:00');
      case EWorkTime.선택:
        return new WorkTimeSlot('8:30', '24:00');
    }
  }

  static fromMultiWorkTime(workTime: EWorkTime) {
    switch (workTime) {
      case EWorkTime.오픈:
        return new WorkTimeSlot('10:00', '16:00');
      case EWorkTime.마감:
        return new WorkTimeSlot('16:00', '22:30');
      case EWorkTime.선택:
        return new WorkTimeSlot('8:30', '24:00');
    }
  }

  constructor(start: string, end: string) {
    const parse = WorkTimeSlotSchema.parse({
      start,
      end,
    });
    this.start = parse.start;
    this.end = parse.end;
  }
}

export const WorkTimeSlotSchema = z.object({
  start: z.string().regex(/^\d{1,2}:\d{2}$/),
  end: z.string().regex(/^\d{1,2}:\d{2}$/),
});

export type IWorkTimeSlot = z.infer<typeof WorkTimeSlotSchema>;
