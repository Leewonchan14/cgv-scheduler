import { DateDay } from '@/entity/interface/DateDay';
import {
  EmployeeCondition,
  IEmployeeSchemaType,
  UserInputCondition,
  WorkConditionEntry,
  WorkConditionOfWeek,
} from '@/entity/types';
import { DynamicEmployeeConditions } from '@/feature/employee/with-schedule/dynamic-employee-condition';
import { FilteredEmployees } from '@/feature/employee/with-schedule/filter-employee-condition';
import { SortEmployeeByWorkCondition } from '@/feature/employee/with-schedule/sort-employee-by-condition';
import { StaticEmployeeCondition } from '@/feature/employee/with-schedule/static-employee-condition';
import { ScheduleCounter } from '@/feature/schedule/schedule-counter';
import { ScheduleErrorCounter } from '@/feature/schedule/schedule-error-counter';
import { delay } from '@/share/libs/util/delay';
import _ from 'lodash';

export class ScheduleGenerator {
  public isTimeOut = false;
  public isDone = false;

  private workConditionOfWeek: UserInputCondition['workConditionOfWeek'];
  private result: WorkConditionOfWeek[] = [];

  private dateDay: DateDay;

  private employeeCache: {
    [key: string]: EmployeeCondition[];
  } = {};
  private scheduleCounter: ScheduleCounter;
  private scheduleErrorCounter = new ScheduleErrorCounter();

  constructor(
    private userInput: UserInputCondition,
    private 최대_스케쥴_갯수: number,
    private headSchedule: WorkConditionEntry[][],
    private tailSchedule: WorkConditionEntry[][],
  ) {
    this.dateDay = new DateDay(this.userInput.startDate);

    // scheduleCounter 초기화
    this.scheduleCounter = new ScheduleCounter(userInput.workConditionOfWeek);

    this.workConditionOfWeek = userInput.workConditionOfWeek;
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
    isExist: boolean,
    workConditionEntry: WorkConditionEntry,
    employee: IEmployeeSchemaType,
  ) {
    // 재귀함수로 배치한 근무자만 카운트
    if (!isExist) {
      this.scheduleCounter.countEmployee(employee);
      workConditionEntry.employee = employee;
    }
  }

  private async recursive(depth: number) {
    await delay(0);

    // 종료 조건
    if (this.isDone) return;

    if (depth >= this.scheduleCounter.getTotalWorkCnt()) {
      if (!this.isValidate()) return;

      this.result.push(_.cloneDeep(this.workConditionOfWeek));

      // 최대 스케쥴 갯수에 도달하면 종료
      if (this.result.length === this.최대_스케쥴_갯수) {
        this.isDone = true;
      }
      return;
    }

    let currentIndex = depth;

    // 현재 요일
    for (const dayOfWeek of this.dateDay.days7().map((d) => d.day())) {
      if (currentIndex >= _.size(this.workConditionOfWeek[dayOfWeek])) {
        currentIndex -= _.size(this.workConditionOfWeek[dayOfWeek]);
        continue;
      }

      const workConditionEntry =
        this.workConditionOfWeek[dayOfWeek][currentIndex];

      const filtered = await this.filteredEmployee(workConditionEntry);
      filtered['가능한 근무자'] = this.sort_근무자들(filtered['가능한 근무자']);

      if (filtered['가능한 근무자'].length === 0) {
        this.scheduleErrorCounter.countEmptyEmployee(workConditionEntry.id);
      }

      // 가능한 사람이 있으면 스케줄에 추가하고 다음 재귀 호출
      for (const employeeCondition of filtered['가능한 근무자']) {
        const isExist = workConditionEntry.employee !== undefined;
        this.prefixRecursive(
          isExist,
          workConditionEntry,
          employeeCondition.employee,
        );
        await this.recursive(depth + 1);
        this.postRecursive(isExist, workConditionEntry);
      }

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
    filteredEmployees['가능한 근무자'] = await new DynamicEmployeeConditions(
      workConditionEntry,
      this.workConditionOfWeek,
      this.scheduleCounter,
      this.userInput,
      filteredEmployees,
      this.headSchedule,
      this.tailSchedule,
    )
      .add_조건1_현재_요일에_투입_안된_근무자()
      .add_조건2_직원의_근무_최대_가능_일수를_안넘는_근무자()
      .add_조건3_전날_마감_근무후_다음날_오픈_근무가_아닌_근무자()
      .add_조건4_최대_연속_근무일수를_안넘는_근무자()
      .add_조건5_멀티_최소인원을_만족하는_근무자()
      .value();

    return filteredEmployees;
  }

  public sort_근무자들(possibleEmployees: EmployeeCondition[]) {
    return new SortEmployeeByWorkCondition(possibleEmployees)
      .add_조건2_근무_가능한_요일이_적은_순()
      .add_조건4_최소_근무_일수가_큰순()
      .add_조건3_최대_근무_가능_일수가_큰순()
      .value();
  }

  private postRecursive(
    isExist: boolean,
    workConditionEntry: WorkConditionEntry,
  ) {
    // 재귀함수로 배치한 근무자만 카운트
    if (!isExist) {
      this.scheduleCounter.discountEmployee(workConditionEntry.employee);
      delete workConditionEntry.employee;
    }
  }

  /*
   * 이때 검사하는 항목은 다음과 같다.
   * 1. 각 근무자의 최소 근무일수를 만족하는지
   * 2. 각 근무자의 최대 근무일수를 넘지 않는지
   */
  private isValidate() {
    const { employeeConditions } = this.userInput;

    let isValid = true;

    for (const employeeCondition of employeeConditions) {
      const count = this.scheduleCounter.getEmployeeCnt(
        employeeCondition.employee,
      );

      if (count < employeeCondition.ableMinWorkCount) {
        this.scheduleErrorCounter.countNotValidAbleMin(
          employeeCondition.employee.id,
        );
        isValid = false;
      }
      if (count > employeeCondition.ableMaxWorkCount) {
        this.scheduleErrorCounter.countNotValidAbleMax(
          employeeCondition.employee.id,
        );
        isValid = false;
      }
    }

    return isValid;
  }

  public getResult() {
    return this.result;
  }
  public getErrorCounter() {
    return this.scheduleErrorCounter.counter;
  }
}
