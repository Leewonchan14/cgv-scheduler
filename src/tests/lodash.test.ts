import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { DateDay } from '@/entity/interface/DateDay';
import { createMockScheduleEntry } from '@/mock/factories/scheduleFactory';
import { describe, expect, test } from '@jest/globals';
import { addDays, differenceInDays, format } from 'date-fns';
import _ from 'lodash';

describe('lodash 테스트', () => {
  test('merge 시 같은 객체를 반환함', () => {
    const obj = { a: 1 };
    const merged = _.merge(obj, { b: 2 });

    expect(obj === merged).toBe(true);
  });

  test('drop, first 시 새로운 객체나 나옴', () => {
    const arr = [1, 2, 3];
    const arr2 = _.drop(arr, 2);

    expect(arr === arr2).toBe(false);
    expect(arr2[0]).toBe(3);
    expect(arr[0]).toBe(1);

    expect(_.first(arr)).toBe(1);
    expect(arr[0]).toBe(1);
  });

  test('EDAY_OF_WEEKS_FROM_START_DATE 함수 테스트', () => {
    const slice = new DateDay(
      new Date('2024-11-25'),
      0,
    ).get요일_시작부터_끝까지DayOfWeek();

    expect(JSON.stringify(slice)).toBe(
      JSON.stringify([
        EDayOfWeek.월,
        EDayOfWeek.화,
        EDayOfWeek.수,
        EDayOfWeek.목,
        EDayOfWeek.금,
        EDayOfWeek.토,
        EDayOfWeek.일,
      ]),
    );
  });

  test('_.assign 시 새로운 객체를 반환하지 않음', () => {
    const a = { a: 1 };
    const c = _.assign(a, { b: 2 });

    expect(a === c).toBe(true);
  });

  test('스케쥴 엔트리 스키마 테스트', () => {
    const schedules = _.range(7).map((i) => ({
      ...createMockScheduleEntry(),
      dateDay: new DateDay(new Date(), i),
    }));

    // console.log('schedules: ', schedules);

    const result = _.chain(schedules)
      .groupBy((s) => format(s.dateDay.date, 'yyyy-MM-dd'))
      .entries()
      .sortBy(([key]) => key)
      .reverse()
      .map(([_, value]) => value)
      .value();

    // console.log('result: ', result);

    expect(result.length).toBe(7);
  });

  test('abc', () => {
    const a = DateDay.fromDate(new Date(), addDays(new Date(), 3));
    const gap = differenceInDays(a.date, a.startDate);

    expect(gap).toBe(3);
  });
});
