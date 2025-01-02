import { EDAY_OF_WEEKS_CORRECT, EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { DateDay } from '@/entity/interface/DateDay';
import { describe, expect, test } from '@jest/globals';
import dayjs from 'dayjs';
import _ from 'lodash';

describe('DateDay test', () => {
  test('add dateDay', () => {
    const dateDay = new DateDay(new Date(), 3);
    const added = DateDay.addDate(new Date(), 3);

    expect(dayjs(dateDay.date).day()).toEqual(dayjs(added).day());
  });

  test('sub dateDay', () => {
    const dateDay = new DateDay(new Date(), 2);
    expect(DateDay.subDate(dateDay.date, dateDay.startDate)).toEqual(2);
  });

  test('dateDay', () => {
    const dateDay1 = new DateDay(DateDay.fromString('2024-12-30').startDate, 0);
    const dateDay2 = new DateDay(dateDay1.startDate, 0);
    expect(dateDay1.format('YYYY-MM-DD')).toEqual(
      dateDay2.format('YYYY-MM-DD'),
    );
  });

  test('sub test', () => {
    const now = new Date();
    dayjs(now).subtract(3, 'D');
  });

  test('get요일_시작부터_끝까지DayOfWeek', () => {
    const dateDay = DateDay.fromString('2024-12-29');
    const total = dateDay.get요일_시작부터_끝까지DayOfWeek();

    expect(dateDay.getDayOfWeek()).toEqual(EDayOfWeek.일);

    expect(total.length).toEqual(7);
    expect(total).toEqual(EDAY_OF_WEEKS_CORRECT);
  });

  test('getDayOfWeekSliceFormStartDateToDayOfWeek', () => {
    const dateDay = DateDay.fromDayOfWeek(
      DateDay.fromString('2024-11-25').date,
      EDayOfWeek.수,
    );

    expect(dateDay.getStartDateDay().getDayOfWeek()).toBe(EDayOfWeek.월);

    expect(dateDay.get요일_시작부터_지금_전날까지()).toEqual([
      EDayOfWeek.월,
      EDayOfWeek.화,
    ]);
  });
  test('getFullSliceFromStartDate 함수 테스트', () => {
    const slice = new DateDay(
      new Date('2024-11-25'),
      2,
    ).get요일_시작부터_끝까지DayOfWeek();

    expect(slice).toStrictEqual([
      EDayOfWeek.월,
      EDayOfWeek.화,
      EDayOfWeek.수,
      EDayOfWeek.목,
      EDayOfWeek.금,
      EDayOfWeek.토,
      EDayOfWeek.일,
    ]);
  });
});
