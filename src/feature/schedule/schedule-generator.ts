import { EDAY_OF_WEEKS } from '@/entity/enums/EDayOfWeek';
import { ISchedule } from '@/entity/interface/ISchedule';
import { ScheduleEntry } from '@/entity/schedule-entry.entity';
import {
  EmployeeCondition,
  IEmployeeSchemaType,
  UserInputCondition,
  WorkConditionEntry,
} from '@/entity/types';
import { DynamicEmployeeConditions } from '@/feature/employee/with-schedule/dynamic-employee-condition';
import { SortEmployeeByWorkCondition } from '@/feature/employee/with-schedule/sort-employee-by-condition';
import { StaticEmployeeCondition } from '@/feature/employee/with-schedule/static-employee-condition';
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
    employee: IEmployeeSchemaType,
  ) {
    this.schedule[workConditionEntry.dateDay.dayOfWeek].push({
      employee,
      ...cloneDeep(workConditionEntry),
    } as ScheduleEntry);
  }

  private async recursive(depth: number) {
    await delay(0);

    // 종료 조건
    if (this.isDone) return;

    if (depth >= this.totalWorkCnt) {
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
    for (const dayOfWeek of this.userInput.startDateDay.get요일_시작부터_끝까지DayOfWeek()) {
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
        this.prefixRecursive(workConditionEntry, employeeCondition.employee);
        await this.recursive(depth + 1);
        this.postRecursive(workConditionEntry);
      }

      // 다음 요일로 넘어가기
      return;
    }
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
      .add_조건2_직원의_가능한_시간()
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
        workConditionEntry.dateDay.dayOfWeek
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
    this.schedule[dateDay.dayOfWeek].pop();
  }

  public getResult() {
    return this.result;
  }
}
