/********************동적 조건들********************/

import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { DateDay } from '@/entity/interface/DateDay';
import { ISchedule } from '@/entity/interface/ISchedule';
import { ScheduleEntry } from '@/entity/schedule-entry.entity';
import { EmployeeCondition, WorkConditionEntry } from '@/entity/types';
import { IScheduleEntryService } from '@/feature/schedule/schedule-entry.service';
import _ from 'lodash';

/**
 * 1. 현재 요일에 투입 되어있는지 체크
 * 2. 직원의 근무 최대 가능 일수 체크
 * 3. 전날 '마감' 근무 후 다음날 '오픈' 근무(방지) 체크
 * 4. 최대 연속 근무일수 체크
 */

export class DynamicEmployeeConditions {
  private 일주일중_전날까지_배치된_모든_스케쥴: WorkConditionEntry[][] = [];
  private dateDay: DateDay;
  private conditions: ((_: EmployeeCondition) => Promise<boolean> | boolean)[] =
    [];
  constructor(
    private workCondition: WorkConditionEntry,
    private employeeConditions: EmployeeCondition[],
    private schedule: ISchedule,
    private maxWorkComboDayCount: number,
    private scheduleEntryService: IScheduleEntryService,
    private workConditions: WorkConditionEntry[],
  ) {
    this.dateDay = DateDay.fromIDateDayEntity(workCondition.dateDay);
    this.일주일중_전날까지_배치된_모든_스케쥴 = this.dateDay
      .get요일_시작부터_지금_전날까지()
      .map((dayOfWeek) => this.schedule[dayOfWeek]);
  }

  add_조건1_현재_요일에_투입_안된_근무자() {
    const condition = (employeeCondition: EmployeeCondition) => {
      const dayOfWeek = this.workCondition.dateDay.dayOfWeek;
      const 현재요일에_투입된_근무자_IDS = this.schedule[dayOfWeek].map(
        ({ employee }) => employee?.id,
      );
      const 이미투입된근무자_IDS = this.workConditions
        .filter((em) => em.employee)
        .map(({ employee }) => employee?.id);

      return !_.union(
        현재요일에_투입된_근무자_IDS,
        이미투입된근무자_IDS,
      ).includes(employeeCondition.employee.id);
    };
    condition.bind(this);
    this.conditions.push(condition);
    return this;
  }

  add_조건2_직원의_근무_최대_가능_일수를_안넘는_근무자() {
    const condition = (employeeCondition: EmployeeCondition) => {
      // 현재요일 이전까지의 근무자 수가 최대 근무 수보다 작은 경우
      const 전날까지_근무한_일수 = this.일주일중_전날까지_배치된_모든_스케쥴
        .flat()
        .filter((s) => s.employee?.id === employeeCondition.employee.id).length;

      return 전날까지_근무한_일수 < employeeCondition.ableMaxWorkCount;
    };
    condition.bind(this);
    this.conditions.push(condition);
    return this;
  }

  // TODO 목요일일때 데이터 베이스와 연동해서 이전 일을 가져오는 로직을 추가해야 함
  add_조건3_전날_마감_근무후_다음날_오픈_근무가_아닌_근무자() {
    const condition = async (employeeCondition: EmployeeCondition) => {
      const isOpen = this.workCondition.workTime === EWorkTime.오픈;
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
      return !(isOpen && isPreviousDayClose);
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

      // 만약 this.maxWorkComboDayCount 보다 작다면 적은만큼가져온다.
      if (
        this.일주일중_전날까지_배치된_모든_스케쥴.length <
        this.maxWorkComboDayCount
      ) {
        const prev = await this.scheduleEntryService.findPreviousSchedule(
          this.workCondition.dateDay.startDate,
          this.maxWorkComboDayCount -
            this.일주일중_전날까지_배치된_모든_스케쥴.length,
        );

        prev.forEach((p) => 최근_최대근무일수_스케쥴.unshift(p));
      }

      const is_이미_최대연속근무만큼_일했음 =
        최근_최대근무일수_스케쥴.length > 1 &&
        최근_최대근무일수_스케쥴.every((dayOfSchedules) =>
          dayOfSchedules.some(
            (s) => s.employee?.id === employeeCondition.employee.id,
          ),
        );

      return !is_이미_최대연속근무만큼_일했음;
    };
    condition.bind(this);
    this.conditions.push(condition);
    return this;
  }

  add_조건5_멀티_최소인원을_만족하는_근무자() {
    const condition = (employeeCondition: EmployeeCondition) => {
      const dayOfWeek = this.workCondition.dateDay.dayOfWeek;

      const mockSchedule = _.cloneDeep(this.schedule[dayOfWeek]);
      mockSchedule.push({
        employee: employeeCondition.employee,
        ...this.workCondition,
      } as ScheduleEntry);

      // 이후 이미 배치된 근무자가 있다면 추가
      this.workConditions.forEach((w, idx) => {
        if (idx < mockSchedule.length) return;
        if (w.employee) {
          mockSchedule.push(w);
        }
      });

      const findMulti = mockSchedule.filter(
        (s) => s.workPosition === EWorkPosition.멀티,
      );

      // 멀티가 없다면 true
      if (findMulti.length === 0) return true;

      // 해당 요일의 마지막 근무 배치가 아니라면 true
      if (this.schedule[dayOfWeek].length !== this.workConditions.length - 1)
        return true;

      const openMul = findMulti.filter(
        (m) => m.workTime === EWorkTime.오픈,
      ).length;
      const openFloor = mockSchedule.filter(
        (m) =>
          m.workTime === EWorkTime.오픈 &&
          m.workPosition === EWorkPosition.플로어,
      ).length;

      if (openMul + openFloor !== 3) {
        return false;
      }

      const closeMul = findMulti.filter(
        (m) => m.workTime === EWorkTime.마감,
      ).length;

      const closeFloor = mockSchedule.filter(
        (m) =>
          m.workTime === EWorkTime.마감 &&
          m.workPosition === EWorkPosition.플로어,
      ).length;

      if (closeMul + closeFloor !== 3) {
        return false;
      }

      return true;
    };

    condition.bind(this);
    this.conditions.push(condition);
    return this;
  }

  /* filter_주차_최소인원을_만족하는_근무자() {
    return this;
  } */

  async filter() {
    const rt: EmployeeCondition[] = [];
    for (const employeeCon of this.employeeConditions) {
      const promises = this.conditions.map((con) =>
        con.call(this, employeeCon),
      );

      const awaited = await Promise.all(promises);

      if (awaited.every(Boolean)) {
        rt.push(employeeCon);
      }
    }

    return rt;
  }
}
