import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { EmployeeCondition } from '@/entity/types';
import { SortEmployeeByWorkCondition } from '@/feature/employee/with-schedule/sort-employee-by-condition';
import { describe, expect, test } from '@jest/globals';
import _ from 'lodash';

/* new SortEmployeeByWorkCondition()
  .add_조건1_근무_가능한_최대_일수가_적은순()
  .add_조건2_근무_가능한_요일이_적은_순()
  .add_조건3_최대_근무_가능_일수가_큰순()
  .sort(); */
describe('근무자 정렬 테스트', () => {
  test('add_조건2_근무_가능한_요일이_적은_순', () => {
    const ids = _.range(4, 0, -1);
    // when 근무 가능한 최대 일수가 [4,3,2,1], 가능한 요일수가 [2,1,3,4] 인 근무자가 있다.
    const employeeConditions = _.zip([4, 3, 2, 1], [2, 1, 3, 4]).map(
      ([id, ableWorkDayCount]) => ({
        employee: {
          id: id!,
          ableWorkTime: _.chain(_.values(EDayOfWeek))
            .take(ableWorkDayCount)
            .map((d) => [d, EWorkTime.오픈])
            .fromPairs()
            .value(),
        },
        ableMaxWorkCount: id!,
      }),
    ) as EmployeeCondition[];

    const sortBy = _.chain([4, 3, 2, 1])
      .zip([2, 1, 3, 4])
      .map(([a, b]) => a! + b!)
      .zip(ids)
      .map(([a, b]) => [b, a])
      .fromPairs()
      .value();

    const actualSorted = new SortEmployeeByWorkCondition(employeeConditions)
      .add_조건2_근무_가능한_요일이_적은_순()
      .value();

    const expectSorted = employeeConditions.sort((a, b) => {
      const aScore = sortBy[a.employee.id];
      const bScore = sortBy[b.employee.id];
      return aScore - bScore;
    });
    // then 근무 가능한 최대 일수가 1,2,3,4 인 순서로 정렬된다.

    expect(expectSorted.map((e) => e.employee.id)).toEqual(
      actualSorted.map((e) => e.employee.id),
    );
  });

  test('add_조건3_최대_근무_가능_일수가_큰순', () => {
    // when
    // given 근무 가능한 최대 일수가 [1,2,3,4] 인 근무자가 있다.
    const employeeConditions = _.range(1, 5).map((id) => ({
      employee: {
        id: id!,
        ableWorkTime: _.chain(_.values(EDayOfWeek))
          .take(id)
          .zip(_.fill(Array(id), EWorkTime.오픈))
          .fromPairs()
          .value(),
      },
      ableMaxWorkCount: id!,
    })) as EmployeeCondition[];

    // then 근무 가능한 최대 일수가 4,3,2,1 인 순서로 정렬된다.
    const actualSorted = new SortEmployeeByWorkCondition(employeeConditions)
      .add_조건3_최대_근무_가능_일수가_큰순()
      .value();

    const expectSorted = employeeConditions.sort(
      (a, b) => b.ableMaxWorkCount - a.ableMaxWorkCount,
    );

    expect(expectSorted.map((e) => e.ableMaxWorkCount)).toEqual(
      actualSorted.map((e) => e.ableMaxWorkCount),
    );
  });
});
