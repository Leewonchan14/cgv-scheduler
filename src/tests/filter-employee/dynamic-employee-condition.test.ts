import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { DateDay } from '@/entity/interface/DateDay';
import { ISchedule } from '@/entity/interface/ISchedule';
import { ScheduleEntry } from '@/entity/schedule-entry.entity';
import { WorkConditionEntry } from '@/entity/types';
import { DynamicEmployeeConditions } from '@/feature/employee/with-schedule/dynamic-employee-condition';
import { StaticEmployeeCondition } from '@/feature/employee/with-schedule/static-employee-condition';
import { IScheduleEntryService } from '@/feature/schedule/schedule-entry.service';
import { WorkTimeSlot } from '@/feature/schedule/work-time-slot-handler';
import {
  floorOrMultiEmployees,
  floorOrMultiOn월Employees,
  restEmployees,
} from '@/mock/employees';
import { userInputCondition } from '@/mock/user-input-condition';
import { describe, expect, test } from '@jest/globals';
import _ from 'lodash';

const startDate = new Date('2024-11-25');

const mockSchedule: ISchedule = {
  [EDayOfWeek.목]: [],
  [EDayOfWeek.금]: [],
  [EDayOfWeek.토]: [],
  [EDayOfWeek.일]: [],
  [EDayOfWeek.월]: [],
  [EDayOfWeek.화]: [],
  [EDayOfWeek.수]: [],
};

const mockScheduleEntryService: IScheduleEntryService = {
  findPreviousSchedule: (_date, _n) => Promise.resolve([]),
};

describe('동적 근무자 조건 필터링', () => {
  test('filter_현재_요일에_투입_안된_근무자', async () => {
    const mockWorkConditionEntry: WorkConditionEntry = {
      dateDay: DateDay.fromDayOfWeek(startDate, EDayOfWeek.월),
      workPosition: EWorkPosition.매점,
      workTime: EWorkTime.오픈,
      timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
    };

    const 모든요일_가능한_직원 = userInputCondition.employeeConditions.filter(
      ({ employee }) =>
        _.keys(_.omitBy(employee.ableWorkTime, _.isUndefined)).length === 7,
    );

    const 월요일에_모든요일이_가능한_직원이_투입되어있는_스케줄: ISchedule = {
      ..._.cloneDeep(mockSchedule),
      월: 모든요일_가능한_직원.map(({ employee }) => {
        return {
          employee,
          ...mockWorkConditionEntry,
        } as ScheduleEntry;
      }),
    };

    const dynamicCondition = new DynamicEmployeeConditions(
      mockWorkConditionEntry,
      _.cloneDeep(userInputCondition.employeeConditions),
      월요일에_모든요일이_가능한_직원이_투입되어있는_스케줄,
      100,
      mockScheduleEntryService,
      [mockWorkConditionEntry],
    );

    const filtered = await dynamicCondition
      .add_조건1_현재_요일에_투입_안된_근무자()
      .filter();

    expect(filtered.length).toEqual(
      userInputCondition.employeeConditions.length -
        모든요일_가능한_직원.length,
    );
  });

  test('filter_직원의_근무_최대_가능_일수를_안넘는_근무자', async () => {
    const mockWorkConditionEntry: WorkConditionEntry = {
      workPosition: EWorkPosition.매점,
      dateDay: DateDay.fromDayOfWeek(startDate, EDayOfWeek.수),
      workTime: EWorkTime.오픈,
      timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
    };

    const 근무자들 = _.cloneDeep(userInputCondition.employeeConditions);

    const 아무_근무자 = _.cloneDeep(userInputCondition.employeeConditions[0]);

    아무_근무자.ableMaxWorkCount = 2;

    근무자들[0] = 아무_근무자;

    const 월_화_모두_투입된_스케쥴: ISchedule = {
      ..._.cloneDeep(mockSchedule),
      월: [
        {
          employee: 아무_근무자.employee,
          ...mockWorkConditionEntry,
          dateDay: DateDay.fromDayOfWeek(startDate, EDayOfWeek.월),
        } as ScheduleEntry,
      ],
      화: [
        {
          employee: 아무_근무자.employee,
          ...mockWorkConditionEntry,
          dateDay: DateDay.fromDayOfWeek(startDate, EDayOfWeek.화),
        } as ScheduleEntry,
      ],
    };

    const dynamicCondition = new DynamicEmployeeConditions(
      {
        ...mockWorkConditionEntry,
        dateDay: DateDay.fromDayOfWeek(startDate, EDayOfWeek.수),
      },
      근무자들,
      월_화_모두_투입된_스케쥴,
      100,
      mockScheduleEntryService,
      [mockWorkConditionEntry],
    );

    const filtered = await dynamicCondition
      .add_조건2_직원의_근무_최대_가능_일수를_안넘는_근무자()
      .filter();

    expect(filtered.length).toEqual(근무자들.length - 1);
  });

  test('filter_전날_마감_근무후_다음날_오픈_근무가_아닌_근무자', async () => {
    const mockWorkConditionEntry: WorkConditionEntry = {
      workPosition: EWorkPosition.매점,
      dateDay: DateDay.fromDayOfWeek(startDate, EDayOfWeek.화),
      workTime: EWorkTime.오픈,
      timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
    };

    const 근무자들 = _.cloneDeep(userInputCondition.employeeConditions);

    const 아무_근무자 = userInputCondition.employeeConditions[0];

    const 월요일에_아무근무자가_마감인_스케쥴: ISchedule = {
      ..._.cloneDeep(mockSchedule),
      월: [
        {
          employee: 아무_근무자.employee,
          ...mockWorkConditionEntry,
          workTime: EWorkTime.마감,
          dateDay: DateDay.fromDayOfWeek(startDate, EDayOfWeek.월),
        } as ScheduleEntry,
      ],
    };

    const dynamicCondition = new DynamicEmployeeConditions(
      {
        ...mockWorkConditionEntry,
        dateDay: DateDay.fromDayOfWeek(startDate, EDayOfWeek.화),
      },
      근무자들,
      월요일에_아무근무자가_마감인_스케쥴,
      100,
      mockScheduleEntryService,
      [mockWorkConditionEntry],
    );

    const filtered = await dynamicCondition
      .add_조건3_전날_마감_근무후_다음날_오픈_근무가_아닌_근무자()
      .filter();

    expect(filtered.length).toEqual(근무자들.length - 1);
  });

  test('filter_최대_연속_근무일수를_안넘는_근무자', async () => {
    const mockWorkConditionEntry: WorkConditionEntry = {
      workPosition: EWorkPosition.매점,
      dateDay: DateDay.fromDayOfWeek(startDate, EDayOfWeek.수),
      workTime: EWorkTime.오픈,
      timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
    };

    const 근무자들 = _.cloneDeep(userInputCondition.employeeConditions);

    const 아무_근무자1 = userInputCondition.employeeConditions[0];

    const 아무_근무자2 = userInputCondition.employeeConditions[1];

    //when: 최대 연속일이 2일 이라 했을때
    const 최대_연속일 = 2;

    //given: 월,화요일에 아무근무자1,2 가 투입되어있는 상태
    const 월요일_화요일에_아무_근무자가_투입되어있는_스케쥴: ISchedule = {
      ..._.cloneDeep(mockSchedule),
      월: [
        {
          employee: 아무_근무자1.employee,
          ...mockWorkConditionEntry,
          workTime: EWorkTime.마감,
          dateDay: DateDay.fromDayOfWeek(startDate, EDayOfWeek.월),
        },
        {
          employee: 아무_근무자2.employee,
          ...mockWorkConditionEntry,
          workTime: EWorkTime.마감,
          dateDay: DateDay.fromDayOfWeek(startDate, EDayOfWeek.월),
        },
      ] as ScheduleEntry[],
      화: [
        {
          employee: 아무_근무자1.employee,
          ...mockWorkConditionEntry,
          workTime: EWorkTime.마감,
          dateDay: DateDay.fromDayOfWeek(startDate, EDayOfWeek.화),
        },
        {
          employee: 아무_근무자2.employee,
          ...mockWorkConditionEntry,
          workTime: EWorkTime.마감,
          dateDay: DateDay.fromDayOfWeek(startDate, EDayOfWeek.화),
        },
      ] as ScheduleEntry[],
    };

    const dynamicCondition = new DynamicEmployeeConditions(
      {
        ...mockWorkConditionEntry,
        dateDay: DateDay.fromDayOfWeek(startDate, EDayOfWeek.수),
      },
      근무자들,
      월요일_화요일에_아무_근무자가_투입되어있는_스케쥴,
      최대_연속일,
      mockScheduleEntryService,
      [mockWorkConditionEntry],
    );

    //then: 가능한 근무자는 2명 빠져야함
    const filtered = await dynamicCondition
      .add_조건4_최대_연속_근무일수를_안넘는_근무자()
      .filter();

    expect(filtered.length).toEqual(근무자들.length - 2);
  });

  test('add_조건5_멀티_최소인원을_만족하는_근무자', async () => {
    //when
    /* 배치가 아래와 같을때
     * 08:30-16:30 매점 2명 필요
     * 08:30-16:30 플로어 2명필요
     * 10:00-16:00 멀티 1명 필요
     * 16:00-22:30 멀티 1명 필요
     * 16:30-24:00 매점 2명 필요
     * 16:30-24:00 플로어 2명
     * */

    const dateDay = DateDay.fromDayOfWeek(startDate, EDayOfWeek.월);

    // given

    const 다들어갈_아무나 = restEmployees[0];
    const 멀티_플로어_가능한_아무나 = floorOrMultiOn월Employees[0];

    const 오픈_매점_2명 = [1, 2].map(() => ({
      dateDay,
      employee: 다들어갈_아무나,
      workPosition: EWorkPosition.매점,
      workTime: EWorkTime.오픈,
      timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
    })) as WorkConditionEntry[];

    const 마감_매점_2명 = [1, 2].map(() => ({
      dateDay,
      employee: 다들어갈_아무나,
      workPosition: EWorkPosition.매점,
      workTime: EWorkTime.마감,
      timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.마감),
    })) as WorkConditionEntry[];

    const 오픈_플로어_2명 = [1, 2].map(() => ({
      dateDay,
      employee: 멀티_플로어_가능한_아무나,
      workPosition: EWorkPosition.플로어,
      workTime: EWorkTime.오픈,
      timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
    })) as WorkConditionEntry[];

    const 마감_플로어_2명 = [1, 2].map(() => ({
      dateDay,
      employee: 멀티_플로어_가능한_아무나,
      workPosition: EWorkPosition.플로어,
      workTime: EWorkTime.마감,
      timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.마감),
    })) as WorkConditionEntry[];

    const 멀티_1명_오픈 = {
      dateDay,
      employee: 멀티_플로어_가능한_아무나,
      workPosition: EWorkPosition.멀티,
      workTime: EWorkTime.오픈,
      timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
    } as WorkConditionEntry;

    const 멀티_1명_마감 = {
      dateDay,
      workPosition: EWorkPosition.멀티,
      workTime: EWorkTime.마감,
      timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
    } as WorkConditionEntry;

    const workCondition = _.concat(
      오픈_매점_2명,
      마감_매점_2명,
      오픈_플로어_2명,
      마감_플로어_2명,
      멀티_1명_오픈,
    ) as WorkConditionEntry[];

    mockSchedule[EDayOfWeek.월] = _.cloneDeep(workCondition) as ScheduleEntry[];

    const possible = new StaticEmployeeCondition(
      멀티_1명_마감,
      _.cloneDeep(userInputCondition.employeeConditions),
      {},
    )
      .add_조건1_직원의_가능한_포지션()
      .filter();

    const dynamicCondition = new DynamicEmployeeConditions(
      멀티_1명_마감,
      _.cloneDeep(possible),
      mockSchedule,
      100,
      mockScheduleEntryService,
      workCondition,
    );

    const filtered = await dynamicCondition
      .add_조건5_멀티_최소인원을_만족하는_근무자()
      .filter();

    expect(filtered.length).toEqual(floorOrMultiEmployees.length);
  });
});
