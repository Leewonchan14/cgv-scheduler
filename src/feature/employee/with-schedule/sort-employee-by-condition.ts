import { EmployeeCondition } from '@/entity/types';
import _ from 'lodash';

// 해당 근무 조건에서 가장 적합한 근무자 순으로 정렬
// 1. 근무 가능한 최대 일수가 적은순
// 2. 근무 가능한 요일이 작은 순
// 3. 불가능한 요일이 많은 순
// 4. 최대 근무 가능 일수가 큰순
// 5. 나머지는 랜덤
export class SortEmployeeByWorkCondition {
  constructor(private employeeConditions: EmployeeCondition[]) {}
  private conditions: ((
    _: EmployeeCondition,
    __: EmployeeCondition,
  ) => number)[] = [];

  // 근무 가능한 요일이 적은 순
  add_조건2_근무_가능한_요일이_적은_순() {
    const condition = (
      a: EmployeeCondition,
      b: EmployeeCondition,
    ) => {
      const get근무가능요일수 = (condition: EmployeeCondition) =>
        _.chain(condition.employee.ableWorkTime)
          .omitBy(_.isUndefined)
          .omit(a.additionalUnableDayOff)
          .size()
          .value();

      const 근무가능요일수A = get근무가능요일수(a);
      const 근무가능요일수B = get근무가능요일수(b);

      const 근무가능최대요일수A = a.ableMaxWorkCount;
      const 근무가능최대요일수B = b.ableMaxWorkCount;

      const A근무수 = 근무가능요일수A + 근무가능최대요일수A;
      const B근무수 = 근무가능요일수B + 근무가능최대요일수B;

      if (A근무수 < B근무수) return -1;
      if (A근무수 > B근무수) return 1;

      return 0;
    };

    condition.bind(this);
    this.conditions.push(condition);
    return this;
  }

  add_조건4_최소_근무_일수가_큰순() {
    const condition = (
      a: EmployeeCondition,
      b: EmployeeCondition,
    ) => {
      if (a.ableMinWorkCount < b.ableMinWorkCount) return 1;
      if (a.ableMinWorkCount > b.ableMinWorkCount) return -1;
      return 0;
    };
    condition.bind(this);
    this.conditions.push(condition);
    return this;
  }

  // 최대 근무 가능 일수가 큰순
  add_조건3_최대_근무_가능_일수가_큰순() {
    const condition = (
      a: EmployeeCondition,
      b: EmployeeCondition,
    ) => {
      if (a.ableMaxWorkCount < b.ableMaxWorkCount) return -1;
      if (a.ableMaxWorkCount > b.ableMaxWorkCount) return 1;
      return 0;
    };

    condition.bind(this);
    this.conditions.push(condition);
    return this;
  }

  value() {
    return this.employeeConditions.sort((a, b) => {
      const reduce = this.conditions.reduce((acc, condition) => {
        if (acc !== 0) return acc;
        return condition.call(this, a, b);
      }, 0);

      if (reduce !== 0) return reduce;
      return Math.random() - 0.5;
    });
  }
}
