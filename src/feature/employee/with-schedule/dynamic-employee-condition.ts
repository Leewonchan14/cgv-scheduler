/********************동적 조건들********************/

import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { DateDay } from '@/entity/interface/DateDay';
import { ScheduleEntry } from '@/entity/schedule-entry.entity';
import {
  EmployeeCondition,
  ISchedule,
  UserInputCondition,
  WorkConditionEntry,
  WorkConditionOfWeek,
} from '@/entity/types';
import {
  FilteredEmployees,
  FilterEmployee,
} from '@/feature/employee/with-schedule/filter-employee-condition';
import { ScheduleCounter } from '@/feature/schedule/schedule-counter';
import { IScheduleEntryService } from '@/feature/schedule/schedule-entry.service';
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
  private maxWorkComboDayCount: number;
  private workConditionOfWeek: WorkConditionOfWeek;
  private workConditions: WorkConditionEntry[] = [];
  private 일주일중_전날까지_배치된_모든_스케쥴: WorkConditionEntry[][] = [];
  private dateDay: DateDay;
  private conditions: ((_: EmployeeCondition) => Promise<boolean> | boolean)[] =
    [];

  constructor(
    private workConditionEntry: WorkConditionEntry,
    private schedule: ISchedule,
    private scheduleEntryService: IScheduleEntryService,
    private scheduleCounter: ScheduleCounter,
    userInputCondition: Pick<
      UserInputCondition,
      'maxWorkComboDayCount' | 'workConditionOfWeek' | 'startDate'
    >,
    filters: FilteredEmployees,
  ) {
    super(filters);
    this.employeeConditions = filters['가능한 근무자'];
    const { maxWorkComboDayCount, workConditionOfWeek, startDate } =
      userInputCondition;
    this.dateDay = DateDay.fromDate(startDate, this.workConditionEntry.date);
    this.maxWorkComboDayCount = maxWorkComboDayCount;
    this.workConditionOfWeek = workConditionOfWeek;

    this.workConditions = workConditionOfWeek[this.dateDay.dayOfWeek];

    this.일주일중_전날까지_배치된_모든_스케쥴 = this.dateDay
      .get요일_시작부터_지금_전날까지()
      .map((dayOfWeek) => this.schedule[dayOfWeek]);
  }

  add_조건1_현재_요일에_투입_안된_근무자() {
    const condition = (employeeCondition: EmployeeCondition) => {
      const 현재요일에_투입된_근무자_IDS = this.schedule[
        this.dateDay.dayOfWeek
      ].map(({ employee }) => employee?.id);
      const 이미투입된근무자_IDS = this.workConditions
        .filter((em) => em.employee)
        .map(({ employee }) => employee?.id);

      const isAble = !_.union(
        현재요일에_투입된_근무자_IDS,
        이미투입된근무자_IDS,
      ).includes(employeeCondition.employee.id);

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

  // TODO 목요일일때 데이터 베이스와 연동해서 이전 일을 가져오는 로직을 추가해야 함
  add_조건3_전날_마감_근무후_다음날_오픈_근무가_아닌_근무자() {
    const condition = async (employeeCondition: EmployeeCondition) => {
      const isOpen = this.workConditionEntry.workTime === EWorkTime.오픈;
      if (!isOpen) return true;

      const prevSchedules: WorkConditionEntry[][] =
        this.일주일중_전날까지_배치된_모든_스케쥴;

      // 만약 첫째요일이라면 prevSchedule 앞에 전날 스케쥴을 추가해준다.
      if (this.dateDay.isFirstDayOfWeek()) {
        const pre = (
          await this.scheduleEntryService.findPreviousSchedule(
            this.dateDay.date,
            1,
          )
        )[0];
        if (pre) {
          prevSchedules.unshift(pre);
        }
      }

      const isPreviousDayClose = !!prevSchedules
        .at(-1)
        ?.find(
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
      // TODO 목요일일때 데이터 베이스와 연동해서 이전 일을 가져오는 로직을 추가해야 함
      const 최근_최대근무일수_스케쥴 = _.cloneDeep(
        this.일주일중_전날까지_배치된_모든_스케쥴,
      );

      // 이전 스케쥴을 가져온다.
      const prev = await this.scheduleEntryService.findPreviousSchedule(
        this.dateDay.startDate,
        this.maxWorkComboDayCount - 1,
      );

      prev.forEach((p) => 최근_최대근무일수_스케쥴.unshift(p));

      // 현재 요일 스케쥴을 추가
      const mockScheduleOfDay = _.cloneDeep(
        this.schedule[this.dateDay.dayOfWeek] ?? [],
      );
      mockScheduleOfDay.push({
        employee: employeeCondition.employee,
        ...this.workConditionEntry,
      } as ScheduleEntry);
      for (let i = 0; i < this.workConditions.length; i++) {
        if (i < mockScheduleOfDay.length) continue;
        if (!this.workConditions[i].employee) continue;
        mockScheduleOfDay.push(this.workConditions[i] as ScheduleEntry);
      }

      최근_최대근무일수_스케쥴.push(mockScheduleOfDay);

      // 나머지 요일 스케쥴을 추가
      const nextDays = this.dateDay.get요일_내일부터_끝까지DateDay();

      for (const nextDayOfWeek of nextDays) {
        최근_최대근무일수_스케쥴.push(
          this.workConditionOfWeek[nextDayOfWeek.dayOfWeek] ?? [],
        );
      }

      // 최대 연속 근무일수를 넘는지 체크
      const counts = 최근_최대근무일수_스케쥴.map((s) =>
        _.sumBy(s, (c) =>
          c.employee?.id === employeeCondition.employee.id ? 1 : 0,
        ),
      );

      let cnt = 0;
      _.range(this.maxWorkComboDayCount).forEach((i) => (cnt += counts[i]));

      let is_이미_최대연속근무만큼_일했음 = cnt >= this.maxWorkComboDayCount;

      for (let i = 1; i < counts.length - this.maxWorkComboDayCount + 1; i++) {
        if (is_이미_최대연속근무만큼_일했음) break;
        cnt += counts[i + this.maxWorkComboDayCount - 1];
        cnt -= counts[i - 1];

        is_이미_최대연속근무만큼_일했음 = cnt >= this.maxWorkComboDayCount;
      }

      const isAble = !is_이미_최대연속근무만큼_일했음;

      this.addFilters(isAble, '최대 연속 근무일수를 넘었음', employeeCondition);

      return isAble;
    };
    condition.bind(this);
    this.conditions.push(condition);
    return this;
  }

  add_조건5_멀티_최소인원을_만족하는_근무자() {
    const condition = (employeeCondition: EmployeeCondition) => {
      const mockSchedule = _.cloneDeep(
        this.schedule[this.dateDay.dayOfWeek] ?? [],
      );
      mockSchedule.push({
        ...this.workConditionEntry,
        employee: employeeCondition.employee,
      } as ScheduleEntry);

      // 이후 이미 배치된 근무자가 있다면 추가
      this.workConditions.forEach((w, idx) => {
        if (idx < mockSchedule.length) return;
        if (w.employee) {
          mockSchedule.push(w as ScheduleEntry);
        }
      });

      // 해당 요일의 마지막 근무 배치가 아니라면 true
      if (mockSchedule.length !== this.workConditions.length) return true;

      const findMulti = mockSchedule.filter(
        (s) => s.workPosition === EWorkPosition.멀티,
      );

      // 멀티가 없다면 true
      if (findMulti.length === 0) return true;

      const workTimeSlots = findMulti.map((m) =>
        WorkTimeSlot.fromWorkConditionEntry(m),
      );
      let listGap30 = workTimeSlots.flatMap((s) => s.getHourMinuteListGap30());

      listGap30 = _.uniqBy(listGap30, (v) => v.hour * 60 + v.minute);

      // 30분 간격으로 모든 간격안에 플로어 + 멀티 가능한 근무자가 3명이상이면 true
      const isAble = listGap30.every((hm) => {
        const filteredSchedules = mockSchedule.filter(
          (wCon) =>
            [EWorkPosition.플로어, EWorkPosition.멀티].includes(
              wCon.workPosition,
            ) && WorkTimeSlot.fromTimeSlot(wCon.timeSlot).isContainPoint(hm),
        );
        // TODO : 멀티 최소 인원을 입력받아서 처리해야함
        return filteredSchedules.length >= 3;
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
