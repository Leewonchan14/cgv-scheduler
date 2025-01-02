import { EDAY_OF_WEEKS_CORRECT, EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import _ from 'lodash';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);


const ko = 'Asia/Seoul';

export class DateDay {
  lib: dayjs.Dayjs;
  constructor(private date: Date) {
    this.lib = dayjs(this.date).tz(ko);
  }

  static fromString(str: string) {
    return new DateDay(dayjs(str).tz(ko).toDate());
  }

  format(str: string) {
    return dayjs(this.date).format(str);
  }

  day() {
    return EDAY_OF_WEEKS_CORRECT[this.lib.day()];
  }

  days7() {
    return _.range(0, 7).map(
      (i) => new DateDay(this.lib.add(i, 'day').toDate()),
    );
  }

  afterDaysFor(day: number) {
    return _.range(0, day).map((i) => new DateDay(this.lib.add(i, 'day').toDate()));
  }

  nextDateByDay(dayOfWeek: EDayOfWeek): DateDay {
    while (this.day() !== dayOfWeek) {
      this.lib = this.lib.add(1, 'day');
    }
    return new DateDay(this.lib.toDate());
  }

  prevDateByDay(dayOfWeek: EDayOfWeek): DateDay {
    while (this.day() !== dayOfWeek) {
      this.lib = this.lib.subtract(1, 'day');
    }
    return new DateDay(this.lib.toDate());
  }
}
