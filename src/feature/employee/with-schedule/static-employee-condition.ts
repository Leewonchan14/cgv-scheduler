import { EmployeeCondition, WorkConditionEntry } from '@/entity/types';
import _ from 'lodash';

/********************정적 조건들********************/
/**
 * 1. 직원의 가능한 포지션인지 체크
 * 2. 직원의 가능한 날인지 체크
 * 3. 직원의 추가 휴무일인지 체크
 */

export class StaticEmployeeCondition {
  private key: string;
  private conditions: ((_: EmployeeCondition) => boolean)[] = [];
  constructor(
    private workConditionEntry: WorkConditionEntry,
    private employeeConditions: EmployeeCondition[],
    private possibleEmployeesCache: {
      [key: string]: EmployeeCondition[];
    },
  ) {
    // key로 캐시 확인
    this.key = StaticEmployeeCondition.getCacheKey(workConditionEntry);
    if (this._checkCache()) {
      this.employeeConditions = _.cloneDeep(possibleEmployeesCache[this.key]);
    }
  }

  static getCacheKey({
    dateDay,
    workPosition,
    workTime,
    workTimeStart,
  }: Partial<WorkConditionEntry>) {
    return [dateDay?.getDayOfWeek(), workPosition, workTime, workTimeStart]
      .filter((v) => v !== undefined)
      .join('-');
  }

  add_조건1_직원의_가능한_포지션(): this {
    const condition = (employeeCondition: EmployeeCondition) => {
      return employeeCondition.employee.ableWorkPosition.includes(
        this.workConditionEntry.workPosition,
      );
    };

    condition.bind(this);
    this.conditions.push(condition);
    return this;
  }

  add_조건2_직원의_가능한_날(): this {
    const condition = (employeeCondition: EmployeeCondition) => {
      const dayOfWeek = this.workConditionEntry.dateDay.getDayOfWeek();
      return (
        dayOfWeek in
        _.omitBy(employeeCondition.employee.ableWorkTime, _.isUndefined)
      );
    };

    condition.bind(this);
    this.conditions.push(condition);
    return this;
  }

  add_조건3_직원의_추가_휴무일(): this {
    const condition = (employeeCondition: EmployeeCondition) => {
      const dayOfWeek = this.workConditionEntry.dateDay.getDayOfWeek();
      const additionalUnableDayOff = employeeCondition.additionalUnableDayOff;

      return !additionalUnableDayOff?.includes(dayOfWeek);
    };

    condition.bind(this);
    this.conditions.push(condition);

    return this;
  }

  private _checkCache() {
    if (this.key in this.possibleEmployeesCache) {
      return true;
    }
    return false;
  }

  filter(): EmployeeCondition[] {
    // 캐시가 있으면 캐시 반환
    if (this._checkCache()) return this.possibleEmployeesCache[this.key];

    // 모든 조건을 만족하는 직원만 필터링
    const filtered = this.employeeConditions.filter((employeeCondition) => {
      return this.conditions.every((condition) =>
        condition.call(this, employeeCondition),
      );
    });

    // 캐시에 저장
    this.possibleEmployeesCache[this.key] = filtered;
    return filtered;
  }
}
