import { Employee } from '@/entity/employee.entity';
import { EDAY_OF_WEEKS, EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { ISchedule } from '@/entity/interface/ISchedule';
import { ScheduleEntry } from '@/entity/schedule-entry.entity';
import {
  EmployeeCondition,
  UserInputCondition,
  WorkConditionEntry,
} from '@/entity/types';
import { DynamicEmployeeConditions } from '@/feature/employee/with-schedule/dynamic-employee-condition';
import { SortEmployeeByWorkCondition } from '@/feature/employee/with-schedule/sort-employee-by-condition';
import { StaticEmployeeCondition } from '@/feature/employee/with-schedule/static-employee-condition';
import { delay } from '@/share/libs/util/delay';
import _ from 'lodash';

export class ScheduleGenerator {
  public isTimeOut = false;
  public isDone = false;

  private result = [] as {
    [key in EDayOfWeek]: ScheduleEntry[];
  }[];

  private schedule: ISchedule = _.chain(EDAY_OF_WEEKS)
    .map((day) => [day, []])
    .fromPairs()
    .value() as ISchedule;

  private depth = 0;
  private totalWorkCnt = 0;

  private possibleEmployees: EmployeeCondition[] = [];
  private employeeCache: {
    [key: string]: EmployeeCondition[];
  } = {};

  constructor(
    private userInput: UserInputCondition,
    private 최대_스케쥴_갯수: number,
  ) {
    // 총 근무 갯수 계산
    this.totalWorkCnt = _.chain(this.userInput.workConditionOfWeek)
      .omitBy(_.isUndefined)
      .map(_.size)
      .sum()
      .value();
  }

  public timeStart(limitMs: number) {
    // 5초 후에 isFirst를 true로 변경
    setTimeout(() => {
      this.isDone = true;
      this.isTimeOut = true;
    }, limitMs);

    return this;
  }

  private prefixRecursive(
    workConditionEntry: WorkConditionEntry,
    employee: Employee,
  ) {
    this.depth += 1;

    this.schedule[workConditionEntry.dateDay.getDayOfWeek()].push({
      employee,
      ...workConditionEntry,
    } as ScheduleEntry);
  }

  public async recursiveGenerate() {
    await delay(0);

    // 종료 조건
    if (this.isDone) return;

    if (this.depth >= this.totalWorkCnt) {
      this.result.push(_.cloneDeep(this.schedule));

      // 최대 스케쥴 갯수에 도달하면 종료
      if (this.result.length === this.최대_스케쥴_갯수) {
        this.isDone = true;
      }
      return;
    }

    const { workConditionOfWeek: workConditions } = this.userInput;
    let currentIndex = this.depth;

    // 현재 요일
    for (const dayOfWeek of this.userInput.startDateDay.get요일_시작부터_끝까지()) {
      if (workConditions[dayOfWeek] === undefined) continue;
      if (currentIndex >= _.size(workConditions[dayOfWeek])) {
        currentIndex -= _.size(workConditions[dayOfWeek]);
        continue;
      }

      const workConditionEntry = workConditions[dayOfWeek][currentIndex];

      await this.filter_가능한_모든_근무자들(workConditionEntry);
      this.sort_근무자들();

      // 가능한 사람이 있으면 스케줄에 추가하고 다음 재귀 호출
      for (const employeeCondition of this.possibleEmployees) {
        await this.doRecursive(workConditionEntry, employeeCondition.employee);
      }
    }
  }

  private async doRecursive(
    workConditionEntry: WorkConditionEntry,
    employee: Employee,
  ) {
    this.prefixRecursive(workConditionEntry, employee);
    await this.recursiveGenerate();
    this.postRecursive(workConditionEntry);
  }

  private async filter_가능한_모든_근무자들(
    workConditionEntry: WorkConditionEntry,
  ) {
    // 이미 배치 된 근무자라면 필터링 하지 않음
    if (workConditionEntry.employee) {
      this.possibleEmployees = [
        {
          employee: workConditionEntry.employee,
        } as EmployeeCondition,
      ];
      return this;
    }

    /******************** 정적 조건들 ********************/
    this.possibleEmployees = new StaticEmployeeCondition(
      workConditionEntry,
      this.userInput.employeeConditions,
      this.employeeCache,
    )
      .add_조건1_직원의_가능한_포지션()
      .add_조건2_직원의_가능한_날()
      .add_조건3_직원의_추가_휴무일()
      .filter();

    /******************** 동적 조건들 ********************/
    this.possibleEmployees = await new DynamicEmployeeConditions(
      workConditionEntry,
      this.possibleEmployees,
      this.schedule,
      this.userInput.maxWorkComboDayCount,
      { findPreviousSchedule: async () => [] },
      this.userInput.workConditionOfWeek?.[
        workConditionEntry.dateDay.getDayOfWeek()
      ] ?? [],
    )
      .add_조건1_현재_요일에_투입_안된_근무자()
      .add_조건2_직원의_근무_최대_가능_일수를_안넘는_근무자()
      .add_조건3_전날_마감_근무후_다음날_오픈_근무가_아닌_근무자()
      .add_조건4_최대_연속_근무일수를_안넘는_근무자()
      .add_조건5_멀티_최소인원을_만족하는_근무자()
      .filter();

    return this;
  }

  private sort_근무자들() {
    this.possibleEmployees = new SortEmployeeByWorkCondition(
      this.possibleEmployees,
    )
      .add_조건2_근무_가능한_요일이_적은_순()
      .add_조건3_최대_근무_가능_일수가_큰순()
      .sort();

    return this;
  }

  private postRecursive({ dateDay }: WorkConditionEntry) {
    this.schedule[dateDay.getDayOfWeek()].pop();
    this.depth -= 1;
  }

  public getResult() {
    return this.result;
  }
}
