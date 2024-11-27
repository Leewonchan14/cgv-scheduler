import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { DateDay } from '@/entity/interface/DateDay';
import { describe, expect, test } from '@jest/globals';

describe('DateDay test', () => {
  test('getDayOfWeekSliceFormStartDateToDayOfWeek', () => {
    const dateDay = DateDay.fromDayOfWeek(
      new Date('2024-11-25'),
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
