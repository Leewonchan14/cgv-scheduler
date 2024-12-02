import { EDAY_OF_WEEKS, EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { DateDay } from '@/entity/interface/DateDay';
import { ScheduleEntry } from '@/entity/schedule-entry.entity';
import {
  EmployeeCondition,
  ISchedule,
  UserInputCondition,
  WorkConditionEntry,
} from '@/entity/types';
import { DynamicEmployeeConditions } from '@/feature/employee/with-schedule/dynamic-employee-condition';
import { FilteredEmployees } from '@/feature/employee/with-schedule/filter-employee-condition';
import { SortEmployeeByWorkCondition } from '@/feature/employee/with-schedule/sort-employee-by-condition';
import { StaticEmployeeCondition } from '@/feature/employee/with-schedule/static-employee-condition';
import { ScheduleCounter } from '@/feature/schedule/schedule-counter';
import { delay } from '@/share/libs/util/delay';
import _, { cloneDeep } from 'lodash';

export class ScheduleGenerator {
  public isTimeOut = false;
  public isDone = false;

  private result: ISchedule[] = [];
  private schedule: ISchedule = _.chain(EDAY_OF_WEEKS)
    .map((day) => [day, []])
    .fromPairs()
    .value() as ISchedule;

  private dateDay: DateDay;

  private employeeCache: {
    [key: string]: EmployeeCondition[];
  } = {};
  private scheduleCounter: ScheduleCounter;

  constructor(
    private userInput: UserInputCondition,
    private 최대_스케쥴_갯수: number,
  ) {
    this.dateDay = new DateDay(this.userInput.startDate, 0);

    // scheduleCounter 초기화
    this.scheduleCounter = new ScheduleCounter(userInput.workConditionOfWeek);
  }

  public async generate(limitMs: number) {
    // 5초 후에 isFirst를 true로 변경
    setTimeout(() => {
      this.isDone = true;
      this.isTimeOut = true;
    }, limitMs);

    await this.recursive(0);
  }

  private prefixRecursive(
    workConditionEntry: WorkConditionEntry,
    employeeCon: EmployeeCondition,
    dayOfWeek: EDayOfWeek,
  ) {
    this.schedule[dayOfWeek].push({
      employee: employeeCon,
      ...cloneDeep(workConditionEntry),
    } as ScheduleEntry);

    // 재귀함수로 배치한 근무자만 카운트
    this.scheduleCounter.countEmployee(workConditionEntry.employee);
  }

  private async recursive(depth: number) {
    await delay(0);

    // 종료 조건
    if (this.isDone) return;

    if (depth >= this.scheduleCounter.getTotalWorkCnt()) {
      if (!this.isValidate()) return;

      this.result.push(_.cloneDeep(this.schedule));

      // 최대 스케쥴 갯수에 도달하면 종료
      if (this.result.length === this.최대_스케쥴_갯수) {
        this.isDone = true;
      }
      return;
    }

    const { workConditionOfWeek: workConditions } = this.userInput;
    let currentIndex = depth;

    // 현재 요일
    for (const dayOfWeek of this.dateDay.get요일_시작부터_끝까지DayOfWeek()) {
      if (workConditions[dayOfWeek] === undefined) continue;
      if (currentIndex >= _.size(workConditions[dayOfWeek])) {
        currentIndex -= _.size(workConditions[dayOfWeek]);
        continue;
      }

      const workConditionEntry = workConditions[dayOfWeek][currentIndex];

      const filtered = await this.filteredEmployee(workConditionEntry);
      filtered['가능한 근무자'] = this.sort_근무자들(filtered['가능한 근무자']);

      // 가능한 사람이 있으면 스케줄에 추가하고 다음 재귀 호출
      for (const employeeCondition of filtered['가능한 근무자']) {
        this.prefixRecursive(workConditionEntry, employeeCondition, dayOfWeek);
        await this.recursive(depth + 1);
        this.postRecursive(dayOfWeek);
      }

      // 다음 요일로 넘어가기
      return;
    }
  }

  public async filteredEmployee(
    workConditionEntry: WorkConditionEntry,
  ): Promise<FilteredEmployees> {
    const filteredEmployees: FilteredEmployees = {
      '가능한 근무자': [],
    };
    // 이미 배치 된 근무자라면 필터링 하지 않음
    if (workConditionEntry.employee) {
      filteredEmployees['가능한 근무자'].push({
        employee: workConditionEntry.employee,
      } as EmployeeCondition);

      return filteredEmployees;
    }

    filteredEmployees['가능한 근무자'] = this.userInput.employeeConditions;

    /******************** 정적 조건들 ********************/
    new StaticEmployeeCondition(
      workConditionEntry,
      this.employeeCache,
      filteredEmployees,
    )
      .add_조건1_직원의_가능한_포지션()
      .add_조건2_직원의_가능한_시간()
      .add_조건3_직원의_추가_휴무일()
      .value();

    /******************** 동적 조건들 ********************/
    await new DynamicEmployeeConditions(
      workConditionEntry,
      this.schedule,
      { findPreviousSchedule: async () => [] },
      this.scheduleCounter,
      this.userInput,
      filteredEmployees,
    )
      .add_조건1_현재_요일에_투입_안된_근무자()
      .add_조건2_직원의_근무_최대_가능_일수를_안넘는_근무자()
      .add_조건3_전날_마감_근무후_다음날_오픈_근무가_아닌_근무자()
      .add_조건4_최대_연속_근무일수를_안넘는_근무자()
      .add_조건5_멀티_최소인원을_만족하는_근무자()
      .value();

    return filteredEmployees;
  }

  private sort_근무자들(possibleEmployees: EmployeeCondition[]) {
    return new SortEmployeeByWorkCondition(possibleEmployees)
      .add_조건2_근무_가능한_요일이_적은_순()
      .add_조건4_최소_근무_일수가_큰순()
      .add_조건3_최대_근무_가능_일수가_큰순()
      .value();
  }

  private postRecursive(dayOfWeek: EDayOfWeek) {
    const pushed = this.schedule[dayOfWeek].pop();

    // 재귀함수로 배치한 근무자만 카운트
    this.scheduleCounter.discountEmployee(pushed?.employee);
  }

  /*
   * 이때 검사하는 항목은 다음과 같다.
   * 1. 각 근무자의 최소 근무일수를 만족하는지
   * 2. 각 근무자의 최대 근무일수를 넘지 않는지
   */
  private isValidate() {
    const { employeeConditions } = this.userInput;

    for (const employeeCondition of employeeConditions) {
      const count = this.scheduleCounter.getEmployeeCnt(
        employeeCondition.employee,
      );

      if (count < employeeCondition.ableMinWorkCount) return false;
      if (count > employeeCondition.ableMaxWorkCount) return false;
    }

    return true;
  }

  public getResult() {
    return this.result;
  }
}
