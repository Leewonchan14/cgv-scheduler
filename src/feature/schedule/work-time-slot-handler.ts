import { EWorkPosition } from '@/entity/enums/EWorkPosition';
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

  static fromTimeSlot(timeSlot: IWorkTimeSlot) {
    return new WorkTimeSlot(timeSlot.start, timeSlot.end);
  }

  static fromWorkTime(workPosition: EWorkPosition, workTime: EWorkTime) {
    if (workPosition === EWorkPosition.멀티) {
      switch (workTime) {
        case EWorkTime.오픈:
          return new WorkTimeSlot('10:00', '16:00');
        case EWorkTime.마감:
          return new WorkTimeSlot('16:00', '22:30');
        case EWorkTime.선택:
          return new WorkTimeSlot('8:30', '22:30');
      }
    }

    switch (workTime) {
      case EWorkTime.오픈:
        return new WorkTimeSlot('8:30', '16:30');
      case EWorkTime.마감:
        return new WorkTimeSlot('16:30', '24:00');
      case EWorkTime.선택:
        return new WorkTimeSlot('8:30', '22:30');
    }
  }

  static fromWorkConditionEntry(workConditionEntry: WorkConditionEntry) {
    const { workPosition, workTime, timeSlot } = workConditionEntry;
    if (workPosition === EWorkPosition.멀티 && workTime === EWorkTime.선택) {
      return WorkTimeSlot.fromTimeSlot(timeSlot);
    }
    return WorkTimeSlot.fromWorkTime(workPosition, workTime);
  }

  public static parse(time: string) {
    const [hour, minute] = time.split(':').map((v) => parseInt(v));
    return {
      hour,
      minute,
    };
  }

  public static parseDate(date: Date) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  public static fromDate(start: Date, end: Date) {
    const starts = WorkTimeSlot.parseDate(start);
    const ends = WorkTimeSlot.parseDate(end);

    return new WorkTimeSlot(starts, ends);
  }

  public toDate() {
    const start = new Date(`1999-12-12:${this.start}`);
    const end = new Date(`1999-12-12:${this.end}`);

    return { start, end };
  }

  public setStart(start: Date | string) {
    let newStart = '';
    if (typeof start === 'string') {
      WorkTimeSlotSchema.parse({
        start,
        end: start,
      });
      newStart = start;
    } else {
      newStart = WorkTimeSlot.parseDate(start);
    }

    return new WorkTimeSlot(newStart, this.end);
  }

  public setEnd(end: Date | string) {
    let newEnd = '';
    if (typeof end === 'string') {
      WorkTimeSlotSchema.parse({
        start: end,
        end: end,
      });
      newEnd = end;
    } else {
      newEnd = WorkTimeSlot.parseDate(end);
    }

    return new WorkTimeSlot(this.start, newEnd);
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
