import { EDAY_OF_WEEKS_CORRECT, EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import _ from 'lodash';
dayjs.extend(utc);
dayjs.extend(timezone);

const ko = 'Asia/Seoul';

export class DateDay {
  date: Date;
  startDate: Date;
  dayOfWeek: EDayOfWeek;
  lib: dayjs.Dayjs;
  private sliceFullFromStartDate: EDayOfWeek[];
  private sliceFromStartDateToDayOfWeek: EDayOfWeek[];
  private index: number | undefined;
  constructor(
    startDate: Date,
    private next: number,
  ) {
    this.startDate = new Date(startDate);
    if (this.next === 0) this.date = new Date(startDate);
    else this.date = DateDay.addDate(this.startDate, next);
    this.dayOfWeek = this.getDayOfWeek();
  }

  static getDay(date: Date) {
    return dayjs(date).tz(ko).day();
  }

  static getDayOfWeek(date: Date) {
    return EDAY_OF_WEEKS_CORRECT[DateDay.getDay(date)];
  }

  static addDate(date: Date, num: number) {
    return dayjs(date).add(num, 'day').toDate();
  }

  static subDate(date1: Date, date2: Date) {
    return dayjs(date1).diff(dayjs(date2), 'day');
  }

  static fromString(str: string) {
    return new DateDay(dayjs(str).tz(ko).toDate(), 0);
  }

  static fromDayOfWeek(startDate: Date, dayOfWeek: EDayOfWeek) {
    const idx = new DateDay(startDate, 0)
      .get요일_시작부터_끝까지DayOfWeek()
      .indexOf(dayOfWeek);
    return new DateDay(startDate, idx);
  }

  static fromDate(startDate: Date, date: Date) {
    const gap = DateDay.subDate(date, startDate);
    return new DateDay(startDate, gap);
  }

  static getDaysInMonth(date: Date) {
    const lib = dayjs(date).tz(ko);
    return _.range(1, lib.daysInMonth() + 1);
  }

  format(str: string) {
    return dayjs(this.date).format(str);
  }

  getStartDateDay() {
    return new DateDay(this.startDate, 0);
  }

  getDayOfWeek(): EDayOfWeek {
    if (!this.dayOfWeek) {
      this.dayOfWeek = EDAY_OF_WEEKS_CORRECT[DateDay.getDay(this.date)];
    }
    return this.dayOfWeek;
  }

  get요일_시작부터_끝까지DayOfWeek() {
    if (!this.sliceFullFromStartDate) {
      this.sliceFullFromStartDate = this.get요일_시작부터_끝까지DateDay().map(
        (d) => d.getDayOfWeek(),
      );
    }
    return this.sliceFullFromStartDate;
  }

  get요일_시작부터_지금_전날까지() {
    if (!this.sliceFromStartDateToDayOfWeek) {
      this.sliceFromStartDateToDayOfWeek =
        this.get요일_시작부터_끝까지DayOfWeek().slice(
          0,
          this.getIndexOfSlice(),
        );
    }
    return this.sliceFromStartDateToDayOfWeek;
  }

  get요일_시작부터_끝까지DateDay() {
    return _.range(0, 7).map((i) => new DateDay(this.startDate, i));
  }

  get요일_내일부터_끝까지DateDay() {
    return this.get요일_시작부터_끝까지DateDay().slice(
      this.getIndexOfSlice() + 1,
    );
  }

  isSameWeek(date: Date) {
    const template = 'YYYY-MM-DD';
    const format = new DateDay(date, 0).format(template);
    return this.get요일_시작부터_끝까지DateDay().some(
      (d) => d.format(template) === format,
    );
  }

  getIndexOfSlice() {
    if (!this.index) {
      this.index = this.get요일_시작부터_끝까지DayOfWeek().indexOf(
        this.getDayOfWeek(),
      );
    }
    return this.index;
  }

  isFirstDayOfWeek() {
    return this.next === 0;
  }

  getNextDateDayByDayOfWeek(dayOfWeek: EDayOfWeek): DateDay {
    if (this.getDayOfWeek() === dayOfWeek) {
      return this;
    }
    return this.getNextDateDay(1).getNextDateDayByDayOfWeek(dayOfWeek);
  }

  getPrevDateDayByDayOfWeek(dayOfWeek: EDayOfWeek): DateDay {
    if (this.getDayOfWeek() === dayOfWeek) {
      return this;
    }
    return this.getPrevDateDay(1).getPrevDateDayByDayOfWeek(dayOfWeek);
  }

  getNextDateDay(n: number) {
    return new DateDay(this.startDate, this.next + n);
  }

  getPrevDateDay(n: number) {
    return new DateDay(this.startDate, this.next - n);
  }
}
