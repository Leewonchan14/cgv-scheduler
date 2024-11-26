import { IDateDayEntity } from '@/entity/date-day.entity';
import { EDAY_OF_WEEKS_CORRECT, EDayOfWeek } from '@/entity/enums/EDayOfWeek';

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
      this.dayOfWeek = EDAY_OF_WEEKS_CORRECT[this.date.getDay()];
    }
    return this.dayOfWeek;
  }

  get요일_시작부터_끝까지() {
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
