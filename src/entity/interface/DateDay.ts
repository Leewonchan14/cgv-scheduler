import { IDateDayEntity } from '@/entity/date-day.entity';
import { CORRECT_DAY_OF_WEEKS, EDayOfWeek } from '@/entity/enums/EDayOfWeek';

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

    this.date = new Date(this.startDate);
    this.date.setDate(this.startDate.getDate() + this.next);
  }

  static fromDayOfWeek(startDate: Date, dayOfWeek: EDayOfWeek) {
    const index = new DateDay(startDate, 0)
      .get요일_시작부터_끝까지()
      .indexOf(dayOfWeek);
    return new DateDay(startDate, index);
  }

  getStartDateDay() {
    return new DateDay(this.startDate, 0);
  }

  getDayOfWeek(): EDayOfWeek {
    if (!this.dayOfWeek) {
      this.dayOfWeek = CORRECT_DAY_OF_WEEKS[this.date.getDay()];
    }
    return this.dayOfWeek;
  }

  get요일_시작부터_끝까지() {
    if (!this.sliceFullFromStartDate) {
      const index = CORRECT_DAY_OF_WEEKS.indexOf(
        this.getStartDateDay().getDayOfWeek(),
      );
      const front = CORRECT_DAY_OF_WEEKS.slice(index);
      const back = CORRECT_DAY_OF_WEEKS.slice(0, index);
      this.sliceFullFromStartDate = [...front, ...back];
    }
    return this.sliceFullFromStartDate;
  }

  get요일_시작부터_지금_전날까지() {
    if (!this.sliceFromStartDateToDayOfWeek) {
      this.sliceFromStartDateToDayOfWeek = this.get요일_시작부터_끝까지().slice(
        0,
        this.getIndexOfSlice(),
      );
    }
    return this.sliceFromStartDateToDayOfWeek;
  }

  getIndexOfSlice() {
    if (!this.index) {
      this.index = this.get요일_시작부터_끝까지().indexOf(this.getDayOfWeek());
    }
    return this.index;
  }

  isFirstDayOfWeek() {
    return this.next === 0;
  }

  getNextDateDay(n: number) {
    return new DateDay(this.date, this.next + n);
  }

  getPrevDateDay(n: number) {
    return new DateDay(this.date, this.next - n);
  }
}
