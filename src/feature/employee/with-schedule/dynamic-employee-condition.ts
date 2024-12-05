/********************동적 조건들********************/

import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { DateDay } from '@/entity/interface/DateDay';
import {
  EmployeeCondition,
  UserInputCondition,
  WorkConditionEntry,
  WorkConditionOfWeek,
} from '@/entity/types';
import {
  FilteredEmployees,
  FilterEmployee,
} from '@/feature/employee/with-schedule/filter-employee-condition';
import { ScheduleCounter } from '@/feature/schedule/schedule-counter';
import { WorkTimeSlot } from '@/feature/schedule/work-time-slot-handler';
import _ from 'lodash';

declare module './filter-employee-condition' {
  interface FilteredEmployees {
    '현재 요일에 이미 투입 되었음'?: EmployeeCondition[];
    '직원의 근무 최대 가능 일수를 넘었음'?: EmployeeCondition[];
    '전날 마감 근무 후 다음날 오픈 근무로 투입되지 않음'?: EmployeeCondition[];
    '최대 연속 근무일수를 넘었음'?: EmployeeCondition[];
    '멀티 최소 인원을 만족하지 못함'?: EmployeeCondition[];
  }
}

/**
 * 1. 현재 요일에 투입 되어있는지 체크
 * 2. 직원의 근무 최대 가능 일수 체크
 * 3. 전날 '마감' 근무 후 다음날 '오픈' 근무(방지) 체크
 * 4. 최대 연속 근무일수 체크
 */

export class DynamicEmployeeConditions extends FilterEmployee {
  private employeeConditions: EmployeeCondition[];
  private workConditionEntries: WorkConditionEntry[] = [];
  private dateDay: DateDay;
  private conditions: ((_: EmployeeCondition) => Promise<boolean> | boolean)[] =
    [];

  constructor(
    private workConditionEntry: WorkConditionEntry,
    private workConditionOfWeek: WorkConditionOfWeek,
    private scheduleCounter: ScheduleCounter,
    private userInput: Pick<
      UserInputCondition,
      'maxWorkComboDayCount' | 'startDate' | 'multiLimit'
    >,
    filters: FilteredEmployees,
    private headSchedule: WorkConditionEntry[][],
    private tailSchedule: WorkConditionEntry[][],
  ) {
    super(filters);
    this.employeeConditions = filters['가능한 근무자'];
    const { startDate } = this.userInput;
    this.dateDay = DateDay.fromDate(startDate, this.workConditionEntry.date);

    this.workConditionEntries =
      this.workConditionOfWeek[this.dateDay.dayOfWeek];
  }

  add_조건1_현재_요일에_투입_안된_근무자() {
    const condition = (employeeCondition: EmployeeCondition) => {
      const 현재요일에_투입된_근무자_IDS = this.workConditionOfWeek[
        this.dateDay.dayOfWeek
      ].map(({ employee }) => employee?.id);

      const isAble = !현재요일에_투입된_근무자_IDS.includes(
        employeeCondition.employee.id,
      );

      // 필터링 된다면 filtered에 추가
      this.addFilters(
        isAble,
        '현재 요일에 이미 투입 되었음',
        employeeCondition,
      );

      return isAble;
    };
    condition.bind(this);
    this.conditions.push(condition);
    return this;
  }

  add_조건2_직원의_근무_최대_가능_일수를_안넘는_근무자() {
    const condition = (employeeCondition: EmployeeCondition) => {
      const 이제까지_투입된_근무수 = this.scheduleCounter.getEmployeeCnt(
        employeeCondition.employee,
      );

      const isAble =
        이제까지_투입된_근무수 + 1 <= employeeCondition.ableMaxWorkCount;

      this.addFilters(
        isAble,
        '직원의 근무 최대 가능 일수를 넘었음',
        employeeCondition,
      );

      return isAble;
    };
    condition.bind(this);
    this.conditions.push(condition);
    return this;
  }

  add_조건3_전날_마감_근무후_다음날_오픈_근무가_아닌_근무자() {
    const condition = async (employeeCondition: EmployeeCondition) => {
      const isOpen = this.workConditionEntry.workTime === EWorkTime.오픈;
      if (!isOpen) return true;

      let prevSchedules: WorkConditionEntry[] = [];

      // 첫날이면 head에서 가져온다.
      if (this.dateDay.isFirstDayOfWeek()) {
        prevSchedules = this.headSchedule.at(-1)!;
      } else {
        prevSchedules =
          this.workConditionOfWeek[this.dateDay.getPrevDateDay(1).dayOfWeek];
      }

      const isPreviousDayClose = !!prevSchedules.find(
        (s) =>
          s.workTime === EWorkTime.마감 &&
          s.employee?.id === employeeCondition.employee.id,
      );

      const isAble = !(isOpen && isPreviousDayClose);

      this.addFilters(
        isAble,
        '전날 마감 근무 후 다음날 오픈 근무로 투입되지 않음',
        employeeCondition,
      );

      return isAble;
    };

    condition.bind(this);
    this.conditions.push(condition);
    return this;
  }

  add_조건4_최대_연속_근무일수를_안넘는_근무자() {
    const condition = async (employeeCondition: EmployeeCondition) => {
      // 현재 요일 좌,우로 최대 근무일수만큼의 스케쥴을 확인해 최대근무일수보다 많이 근무했는지 확인한다.

      // 이전 스케쥴을 가져온다.
      const prev = this.dateDay
        .get요일_시작부터_지금_전날까지()
        .slice(-this.userInput.maxWorkComboDayCount)
        .map((day) => this.workConditionOfWeek[day]);

      const cloneHead = _.clone(this.headSchedule);

      while (
        cloneHead.length > 0 &&
        prev.length < this.userInput.maxWorkComboDayCount
      ) {
        prev.unshift(cloneHead.pop()!);
      }

      // 이전 스케쥴이 maxWorkComboDayCount 만큼 일했다면 false
      const prevCnt = _.sumBy(prev.flat(), (s) =>
        s.employee?.id === employeeCondition.employee.id ? 1 : 0,
      );

      if (prevCnt >= this.userInput.maxWorkComboDayCount) {
        this.addFilters(
          false,
          '최대 연속 근무일수를 넘었음',
          employeeCondition,
        );
        return false;
      }

      // 다음 스케쥴을 가져온다.
      const next = this.dateDay
        .get요일_내일부터_끝까지DateDay()
        .slice(0, this.userInput.maxWorkComboDayCount)
        .map((day) => this.workConditionOfWeek[day.dayOfWeek]);

      // 만약 부족하다면 다음 스케쥴을 가져온다.
      const cloneTail = _.clone(this.tailSchedule);
      while (
        cloneTail.length > 0 &&
        next.length < this.userInput.maxWorkComboDayCount
      ) {
        next.push(cloneTail.shift()!);
      }

      // 다음 스케쥴이 maxWorkComboDayCount 만큼 일했다면 false
      const nextCnt = _.sumBy(next.flat(), (s) =>
        s.employee?.id === employeeCondition.employee.id ? 1 : 0,
      );

      if (nextCnt >= this.userInput.maxWorkComboDayCount) {
        this.addFilters(
          false,
          '최대 연속 근무일수를 넘었음',
          employeeCondition,
        );
        return false;
      }

      return true;
    };
    condition.bind(this);
    this.conditions.push(condition);
    return this;
  }

  add_조건5_멀티_최소인원을_만족하는_근무자() {
    const condition = (employeeCondition: EmployeeCondition) => {
      const mockEntries = _.cloneDeep(this.workConditionEntries);

      // 해당 요일의 마지막 근무 배치(employee가 undefined인게 1개)가 아니라면 true
      const isLast =
        _.sumBy(mockEntries, (e) => (e.employee === undefined ? 1 : 0)) === 1;

      if (!isLast) return true;

      const findMulti = mockEntries.filter(
        (entry) => entry.workPosition === EWorkPosition.멀티,
      );

      // 멀티가 없다면 true
      if (findMulti.length === 0) return true;

      // 일단 현재 근무자를 추가해준다.
      const findEntry = mockEntries.find(
        (e) => e.id === this.workConditionEntry.id,
      )!;
      findEntry.employee = employeeCondition.employee;

      const workTimeSlots = findMulti.map((m) =>
        WorkTimeSlot.fromWorkConditionEntry(m),
      );
      let listGap30 = workTimeSlots.flatMap((s) => s.getHourMinuteListGap30());
      listGap30 = _.uniqBy(listGap30, (v) => v.hour * 60 + v.minute);

      // 30분 간격으로 모든 간격안에 플로어 + 멀티 가능한 근무자가 3명이상이면 true
      const isAble = listGap30.every((hm) => {
        const filteredSchedules = mockEntries.filter(
          (wCon) =>
            [EWorkPosition.플로어, EWorkPosition.멀티].includes(
              wCon.workPosition,
            ) && WorkTimeSlot.fromTimeSlot(wCon.timeSlot).isContainPoint(hm),
        );
        return filteredSchedules.length >= this.userInput.multiLimit;
      });

      this.addFilters(
        isAble,
        '멀티 최소 인원을 만족하지 못함',
        employeeCondition,
      );

      return isAble;
    };

    condition.bind(this);
    this.conditions.push(condition);
    return this;
  }

  async value() {
    const rt: EmployeeCondition[] = [];
    for (const employeeCon of this.employeeConditions) {
      const promises = this.conditions.map((condition) =>
        condition.call(this, employeeCon),
      );

      const awaited = await Promise.all(promises);

      if (awaited.every(Boolean)) {
        rt.push(employeeCon);
      }
    }

    this.filterEmployees['가능한 근무자'] = rt;

    return rt;
  }
}
