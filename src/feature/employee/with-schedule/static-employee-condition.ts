import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { DateDay } from '@/entity/interface/DateDay';
import { EmployeeCondition, WorkConditionEntry } from '@/entity/types';
import { FilterEmployee } from '@/feature/employee/with-schedule/filter-employee-condition';
import { format } from 'date-fns';
import _ from 'lodash';

/********************정적 조건들********************/
/**
 * 1. 직원의 가능한 포지션인지 체크
 * 2. 직원의 가능한 날인지 체크
 * 3. 직원의 추가 휴무일인지 체크
 */

export enum StaticConditionKey {
  '불가능한 표지션' = '불가능한 표지션',
  '불가능한 요일 및 시간' = '불가능한 요일 및 시간',
  '추가로 쉬는날' = '추가로 쉬는날',
}

export class StaticEmployeeCondition extends FilterEmployee {
  private dayOfWeek: EDayOfWeek;
  private key: string;
  private conditions: ((_: EmployeeCondition) => boolean)[] = [];
  constructor(
    private workConditionEntry: WorkConditionEntry,
    private employeeConditions: EmployeeCondition[],
    private possibleEmployeesCache: {
      [key: string]: EmployeeCondition[];
    },
  ) {
    super();
    this.dayOfWeek = new DateDay(
      this.workConditionEntry.date,
      0,
    ).getDayOfWeek();

    // key로 캐시 확인
    this.key = StaticEmployeeCondition.getCacheKey(workConditionEntry);
    if (this._checkCache()) {
      this.employeeConditions = _.cloneDeep(possibleEmployeesCache[this.key]);
    }
  }

  static getCacheKey({
    date,
    workPosition,
    workTime,
    timeSlot,
  }: Partial<WorkConditionEntry>) {
    return [
      date ? format(date, 'yyyy-MM-dd') : undefined,
      workPosition,
      workTime,
      JSON.stringify(timeSlot),
    ]
      .filter((v) => v !== undefined)
      .join('-');
  }

  add_조건1_직원의_가능한_포지션(): this {
    const condition = (employeeCondition: EmployeeCondition) => {
      const isAble = employeeCondition.employee.ableWorkPosition.includes(
        this.workConditionEntry.workPosition,
      );

      this.addFilters(
        isAble,
        StaticConditionKey['불가능한 표지션'],
        employeeCondition,
      );

      return isAble;
    };

    condition.bind(this);
    this.conditions.push(condition);
    return this;
  }

  add_조건2_직원의_가능한_시간(): this {
    const condition = (employeeCondition: EmployeeCondition) => {
      const ableWorkTime = _.omitBy(
        employeeCondition.employee.ableWorkTime,
        _.isUndefined,
      );

      const isAble =
        this.workConditionEntry.workTime === EWorkTime.선택
          ? this.dayOfWeek in ableWorkTime
          : this.dayOfWeek in ableWorkTime &&
            ableWorkTime[this.dayOfWeek].includes(
              this.workConditionEntry.workTime,
            );

      this.addFilters(
        isAble,
        StaticConditionKey['불가능한 요일 및 시간'],
        employeeCondition,
      );

      return isAble;
    };

    condition.bind(this);
    this.conditions.push(condition);
    return this;
  }

  add_조건3_직원의_추가_휴무일(): this {
    const condition = (employeeCondition: EmployeeCondition) => {
      const additionalUnableDayOff = employeeCondition.additionalUnableDayOff;

      const isAble = !additionalUnableDayOff?.includes(this.dayOfWeek);

      this.addFilters(
        isAble,
        StaticConditionKey['추가로 쉬는날'],
        employeeCondition,
      );

      return isAble;
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
