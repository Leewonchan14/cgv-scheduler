import { Employee } from '@/entity/employee.entity';
import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { DateDay } from '@/entity/interface/DateDay';

export interface UserInputCondition {
  // 스케쥴 시작일
  startDateDay: DateDay;

  // 최대 연속 근무 일수
  maxWorkComboDayCount: number;

  // 각 근무자의 고유 사정 조건
  employeeConditions: EmployeeCondition[];

  // 근무 조건
  workConditionOfWeek: WorkConditionOfWeek;
}

// 각 근무자의 고유 사정 조건
export type EmployeeCondition = {
  // 투입 가능한 직원
  employee: Employee;

  // 근무 가능한 최소 일수
  ableMinWorkCount: number;

  // 근무 가능한 최대 일수
  ableMaxWorkCount: number;

  // 추가로 불가능한 요일
  additionalUnableDayOff: EDayOfWeek[];
};

export type WorkConditionOfWeek = {
  [K in EDayOfWeek]?: WorkConditionEntry[];
};

export type WorkConditionEntry = {
  dateDay: DateDay;

  // 이미 배치된 근무자
  employee?: Employee;

  // 근무 포지션
  workPosition: EWorkPosition;

  // 오픈? 마감? 선택?
  workTime: EWorkTime;
  // 근무 시작 시간 (선택 시)
  workTimeStart?: Date;
  // 근무 종료 시간 (선택 시)
  workTimeEnd?: Date;
};
