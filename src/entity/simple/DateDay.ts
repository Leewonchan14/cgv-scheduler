import { EDAY_OF_WEEKS_CORRECT, EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'date_day' })
export class DateDay {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  date: Date;
  
  private dayOfWeek: EDayOfWeek;
  private sliceFromStartDate: EDayOfWeek[];
  private sliceFromStartDateToDayOfWeek: EDayOfWeek[];
  private index: number | undefined;
  constructor(
    private startDate: Date,
    private next: number,
  ) {
    this.startDate = new Date(startDate);
    this.date = this.getDate();
  }

  static fromDayOfWeek(startDate: Date, dayOfWeek: EDayOfWeek) {
    const index = new DateDay(startDate, 0)
      .getDayOfWeekSliceFromStartDate()
      .indexOf(dayOfWeek);
    return new DateDay(startDate, index);
  }

  getStartDate() {
    return new DateDay(this.startDate, 0);
  }

  getDate() {
    if (!this.date) {
      this.date = new Date(this.startDate);
      this.date.setDate(this.startDate.getDate() + this.next);
    }

    return this.date;
  }

  getDayOfWeek(): EDayOfWeek {
    if (!this.dayOfWeek) {
      this.dayOfWeek = EDAY_OF_WEEKS_CORRECT[this.date.getDay()];
    }
    return this.dayOfWeek;
  }

  getDayOfWeekSliceFromStartDate() {
    if (!this.sliceFromStartDate) {
      this.sliceFromStartDate = [
        ...EDAY_OF_WEEKS_CORRECT.slice(this.getDate().getDay()),
        ...EDAY_OF_WEEKS_CORRECT.slice(0, this.getDate().getDay()),
      ];
    }

    return this.sliceFromStartDate;
  }

  getDayOfWeekSliceFormStartDateToDayOfWeek() {
    if (!this.sliceFromStartDateToDayOfWeek) {
      this.sliceFromStartDateToDayOfWeek =
        this.getDayOfWeekSliceFromStartDate().slice(
          0,
          this.getIndexOfSlice() + 1,
        );
    }
    return this.sliceFromStartDateToDayOfWeek;
  }

  getIndexOfSlice() {
    if (this.index === undefined) {
      this.index = this.getDayOfWeekSliceFromStartDate().indexOf(
        this.getDayOfWeek(),
      );
    }
    return this.index;
  }

  isFirstDayOfWeek() {
    return this.getIndexOfSlice() === 0;
  }

  getNextDateDay(n: number) {
    return new DateDay(this.date, this.next + n);
  }

  getPrevDateDay(n: number) {
    return new DateDay(this.date, this.next - n);
  }
}
