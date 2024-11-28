import { EWorkTime, HourMinute } from '@/entity/enums/EWorkTime';
import { WorkConditionEntry } from '@/entity/types';
import _ from 'lodash';
import { z } from 'zod';

export class WorkTimeSlot implements IWorkTimeSlot {
  start: string;
  end: string;
  private startHourMinute: HourMinute;
  private endHourMinute: HourMinute;
  private listGap30: HourMinute[] = [];

  constructor(start: string, end: string) {
    const parse = WorkTimeSlotSchema.parse({
      start,
      end,
    });
    this.start = parse.start;
    this.end = parse.end;
    this.getStartHourMinute();
    this.getEndHourMinute();
  }

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

  static fromWorkConditionEntry(workConditionEntry: WorkConditionEntry) {
    const { workTime, timeSlot } = workConditionEntry;
    switch (workTime) {
      case EWorkTime.오픈:
        return new WorkTimeSlot('10:00', '16:00');
      case EWorkTime.마감:
        return new WorkTimeSlot('16:00', '22:30');
      case EWorkTime.선택:
        return new WorkTimeSlot(timeSlot.start, timeSlot.end);
    }
  }

  public static parse(time: string) {
    const [hour, minute] = time.split(':').map((v) => parseInt(v));
    return {
      hour,
      minute,
    };
  }

  public getStartHourMinute() {
    if (this.startHourMinute) return this.startHourMinute;

    const [startHour, startMinute] = this.start
      .split(':')
      .map((v) => parseInt(v));

    this.startHourMinute = {
      hour: startHour,
      minute: startMinute,
    };

    return this.startHourMinute;
  }

  public getEndHourMinute() {
    if (this.endHourMinute) return this.endHourMinute;

    const [endHour, endMinute] = this.end.split(':').map((v) => parseInt(v));

    this.endHourMinute = {
      hour: endHour,
      minute: endMinute,
    };

    return this.endHourMinute;
  }

  public duration() {
    const { hour: sh, minute: sm } = this.getStartHourMinute();
    const { hour: eh, minute: em } = this.getEndHourMinute();
    const durationHour = eh - sh;
    const durationMinute = em - sm;
    return durationHour * 60 + durationMinute;
  }

  public isContainPoint(hm: HourMinute) {
    // const { hour: h, minute: m } = WorkTimeSlot.parse(point);
    const { hour: h, minute: m } = hm;
    const { hour: sh, minute: sm } = this.getStartHourMinute();
    const { hour: eh, minute: em } = this.getEndHourMinute();

    return sh * 60 + sm <= h * 60 + m && h * 60 + m <= eh * 60 + em;
  }

  public getHourMinuteListGap30() {
    if (this.listGap30.length > 0) return this.listGap30;

    const { hour: sh, minute: sm } = this.getStartHourMinute();
    const { hour: eh, minute: em } = this.getEndHourMinute();

    const s = (sh * 60 + sm) / 30;
    const e = (eh * 60 + em) / 30;

    this.listGap30 = _.range(s, e + 1).map((v) => ({
      hour: Math.floor(v / 2),
      minute: (v % 2) * 30,
    }));

    return this.listGap30;
  }
}

export const WorkTimeSlotSchema = z.object({
  start: z.string().regex(/^\d{1,2}:\d{2}$/),
  end: z.string().regex(/^\d{1,2}:\d{2}$/),
});

export type IWorkTimeSlot = z.infer<typeof WorkTimeSlotSchema>;
