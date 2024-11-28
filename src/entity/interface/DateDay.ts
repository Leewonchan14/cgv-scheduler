import { EDAY_OF_WEEKS_CORRECT, EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { IDateDayEntity } from '@/entity/types';
import { addDays, isSameDay } from 'date-fns';

export class DateDay implements IDateDayEntity {
  date: Date;
  startDate: Date;
  dayOfWeek: EDayOfWeek;
  private sliceFullFromStartDate: EDayOfWeek[];
  private sliceFromStartDateToDayOfWeek: EDayOfWeek[];
  private index: number | undefined;
  constructor(
    startDate: Date,
    private next: number,
  ) {
    this.startDate = new Date(startDate);
    this.date = addDays(this.startDate, this.next);
    this.dayOfWeek = this.getDayOfWeek();
  }

  static fromDayOfWeek(startDate: Date, dayOfWeek: EDayOfWeek) {
    const index = new DateDay(startDate, 0)
      .get요일_시작부터_끝까지DayOfWeek()
      .indexOf(dayOfWeek);
    return new DateDay(startDate, index);
  }

  static fromIDateDayEntity(entity: IDateDayEntity) {
    return DateDay.fromDayOfWeek(entity.startDate, entity.dayOfWeek);
  }

  getStartDateDay() {
    return new DateDay(this.startDate, 0);
  }

  getDayOfWeek(): EDayOfWeek {
    if (!this.dayOfWeek) {
      this.dayOfWeek = EDAY_OF_WEEKS_CORRECT[this.date.getDay()];
    }
    return this.dayOfWeek;
  }

  get요일_시작부터_끝까지DayOfWeek() {
    if (!this.sliceFullFromStartDate) {
      const index = EDAY_OF_WEEKS_CORRECT.indexOf(
        this.getStartDateDay().getDayOfWeek(),
      );
      const front = EDAY_OF_WEEKS_CORRECT.slice(index);
      const back = EDAY_OF_WEEKS_CORRECT.slice(0, index);
      this.sliceFullFromStartDate = [...front, ...back];
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
    return this.get요일_시작부터_끝까지DayOfWeek().map((dayOfWeek) => {
      return DateDay.fromDayOfWeek(this.startDate, dayOfWeek);
    });
  }

  get요일_내일부터_끝까지DateDay() {
    return this.get요일_시작부터_끝까지DateDay().slice(
      this.getIndexOfSlice() + 1,
    );
  }

  isSameWeek(date: Date) {
    return this.get요일_시작부터_끝까지DateDay().some((d) =>
      isSameDay(d.date, date),
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
