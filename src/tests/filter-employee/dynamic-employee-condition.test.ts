import { EWorkTime } from '@/entity/enums/EWorkTime';
import { DateDay } from '@/entity/interface/DateDay';
import { DynamicEmployeeConditions } from '@/feature/employee/with-schedule/dynamic-employee-condition';
import { IScheduleEntryService } from '@/feature/schedule/schedule-entry.service';
import { createMockEmployeeCondition } from '@/mock/factories/employeeFactory';
import { createMockEmptySchedule } from '@/mock/factories/scheduleFactory';
import { createMockWorkConditionEntry } from '@/mock/factories/workConditionEntryFactory';
import { describe, expect, test } from '@jest/globals';

const startDate = new Date('2024-11-25');

const mockScheduleEntryService: IScheduleEntryService = {
  findPreviousSchedule: (_date, _n) => Promise.resolve([]),
};

describe('동적 근무자 조건 필터링', () => {
  test('filter_현재_요일에_투입_안된_근무자', async () => {
    const mockSchedule = createMockEmptySchedule();

    // when: 모든 요일에 가능한 직원이 3명이라고 가정
    const aCon = createMockEmployeeCondition();
    const bCon = createMockEmployeeCondition();
    const cCon = createMockEmployeeCondition();

    const wCon1 = createMockWorkConditionEntry();
    const wCon2 = createMockWorkConditionEntry();
    const wCon3 = createMockWorkConditionEntry();

    const dayOfWeek = wCon1.dateDay.dayOfWeek;

    // when: 요일에 a 가 schedule에 투입되어있고 b는 이미 workCondition에 투입되어있는 상태
    wCon1.employee = aCon.employee;
    wCon2.employee = bCon.employee;
    mockSchedule[dayOfWeek].push(wCon1);

    const workConditionOfDay = [wCon1, wCon2, wCon3];

    // then: a, b는 제외되어야함, c만 가능해야함
    const dynamicCondition = new DynamicEmployeeConditions(
      wCon3,
      [aCon, bCon, cCon],
      mockSchedule,
      100,
      mockScheduleEntryService,
      { [dayOfWeek]: workConditionOfDay },
      {},
    );

    const filtered = await dynamicCondition
      .add_조건1_현재_요일에_투입_안된_근무자()
      .filter();

    expect(filtered.length).toEqual(1);
  });

  test('filter_직원의_근무_최대_가능_일수를_안넘는_근무자', async () => {
    // 최대 2번만 투입가능한 근무자가 이미 2자리에 투입되어 있을때
    // 세번째 근무배치에서는 제외되어야함

    const mockSchedule = createMockEmptySchedule();

    // 1명의 근무자
    const eCon1 = createMockEmployeeCondition();
    eCon1.ableMaxWorkCount = 2;

    // 3개의 근무조건, 1,2번째는 이미 투입되어있음
    const wCon1 = createMockWorkConditionEntry();
    const wCon2 = createMockWorkConditionEntry();
    const wCon3 = createMockWorkConditionEntry();

    const dayOfWeek = wCon1.dateDay.dayOfWeek;

    wCon1.employee = eCon1.employee;
    wCon2.employee = eCon1.employee;

    mockSchedule[dayOfWeek].push(wCon1, wCon2);

    // then: 3번째에서는 제외되어야함

    const dynamicCondition = new DynamicEmployeeConditions(
      wCon3,
      [eCon1],
      mockSchedule,
      100,
      mockScheduleEntryService,
      { [dayOfWeek]: [wCon1, wCon2, wCon3] },
      { [eCon1.employee.id]: 2 },
    );

    const filtered = await dynamicCondition
      .add_조건2_직원의_근무_최대_가능_일수를_안넘는_근무자()
      .filter();

    expect(filtered.length).toEqual(0);
  });

  test('filter_전날_마감_근무후_다음날_오픈_근무가_아닌_근무자', async () => {
    const schedule = createMockEmptySchedule();
    const wCon1 = createMockWorkConditionEntry();
    const wCon2 = createMockWorkConditionEntry();
    const dayOfWeek = wCon1.dateDay.dayOfWeek;

    // 전날 마감, 다음날 오픈
    wCon1.workTime = EWorkTime.마감;
    wCon2.workTime = EWorkTime.오픈;
    wCon2.dateDay = DateDay.fromIDateDayEntity(wCon1.dateDay).getNextDateDay(1);

    schedule[wCon1.dateDay.dayOfWeek].push(wCon1);

    const aCon1 = createMockEmployeeCondition();
    wCon1.employee = aCon1.employee;

    const dynamicCondition = new DynamicEmployeeConditions(
      wCon2,
      [aCon1],
      schedule,
      100,
      mockScheduleEntryService,
      { [dayOfWeek]: [wCon1, wCon2] },
      { [aCon1.employee.id]: 1 },
    );

    const filtered = await dynamicCondition
      .add_조건3_전날_마감_근무후_다음날_오픈_근무가_아닌_근무자()
      .filter();

    expect(filtered.length).toEqual(0);
  });

  test('filter_최대_연속_근무일수를_안넘는_근무자', async () => {
    //when: 최대 연속일이 2일 이라 했을때
    const 최대_연속일 = 2;

    const mockSchedule = createMockEmptySchedule();
    const wCon1 = createMockWorkConditionEntry();
    const dateDay1 = DateDay.fromIDateDayEntity(wCon1.dateDay);
    const dateDay2 = DateDay.fromIDateDayEntity(wCon1.dateDay).getNextDateDay(
      1,
    );
    const dateDay3 = DateDay.fromIDateDayEntity(wCon1.dateDay).getNextDateDay(
      2,
    );

    const wCon2 = createMockWorkConditionEntry({ dateDay: dateDay2 });
    const wCon3 = createMockWorkConditionEntry({ dateDay: dateDay3 });

    const eCon1 = createMockEmployeeCondition();

    //given: 월,화요일에 아무근무자1,2 가 투입되어있는 상태
    wCon1.employee = eCon1.employee;
    wCon2.employee = eCon1.employee;
    mockSchedule[dateDay1.dayOfWeek].push(wCon1);
    mockSchedule[dateDay2.dayOfWeek].push(wCon2);

    const dynamicCondition = new DynamicEmployeeConditions(
      wCon3,
      [eCon1],
      mockSchedule,
      최대_연속일,
      mockScheduleEntryService,
      {
        [dateDay1.dayOfWeek]: [wCon1],
        [dateDay2.dayOfWeek]: [wCon2],
        [dateDay3.dayOfWeek]: [wCon3],
      },
      { [eCon1.employee.id]: 2 },
    );

    //then: 가능한 근무자는 2명 빠져야함
    const filtered = await dynamicCondition
      .add_조건4_최대_연속_근무일수를_안넘는_근무자()
      .filter();

    expect(filtered.length).toEqual(0);
  });

  // test('add_조건5_멀티_최소인원을_만족하는_근무자', async () => {
  //   //when
  //   /* 배치가 아래와 같을때
  //    * 08:30-16:30 매점 2명 필요
  //    * 08:30-16:30 플로어 2명필요
  //    * 10:00-16:00 멀티 1명 필요
  //    * 16:00-22:30 멀티 1명 필요
  //    * 16:30-24:00 매점 2명 필요
  //    * 16:30-24:00 플로어 2명
  //    * */

  //   const dateDay = DateDay.fromDayOfWeek(startDate, EDayOfWeek.월);

  //   // given

  //   const 다들어갈_아무나 = restEmployees[0];
  //   const 멀티_플로어_가능한_아무나 = floorOrMultiOn월Employees[0];

  //   const 오픈_매점_2명 = [1, 2].map(() => ({
  //     dateDay,
  //     employee: 다들어갈_아무나,
  //     workPosition: EWorkPosition.매점,
  //     workTime: EWorkTime.오픈,
  //     timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
  //   })) as WorkConditionEntry[];

  //   const 마감_매점_2명 = [1, 2].map(() => ({
  //     dateDay,
  //     employee: 다들어갈_아무나,
  //     workPosition: EWorkPosition.매점,
  //     workTime: EWorkTime.마감,
  //     timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.마감),
  //   })) as WorkConditionEntry[];

  //   const 오픈_플로어_2명 = [1, 2].map(() => ({
  //     dateDay,
  //     employee: 멀티_플로어_가능한_아무나,
  //     workPosition: EWorkPosition.플로어,
  //     workTime: EWorkTime.오픈,
  //     timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
  //   })) as WorkConditionEntry[];

  //   const 마감_플로어_2명 = [1, 2].map(() => ({
  //     dateDay,
  //     employee: 멀티_플로어_가능한_아무나,
  //     workPosition: EWorkPosition.플로어,
  //     workTime: EWorkTime.마감,
  //     timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.마감),
  //   })) as WorkConditionEntry[];

  //   const 멀티_1명_오픈 = {
  //     dateDay,
  //     employee: 멀티_플로어_가능한_아무나,
  //     workPosition: EWorkPosition.멀티,
  //     workTime: EWorkTime.오픈,
  //     timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
  //   } as WorkConditionEntry;

  //   const 멀티_1명_마감 = {
  //     dateDay,
  //     workPosition: EWorkPosition.멀티,
  //     workTime: EWorkTime.마감,
  //     timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
  //   } as WorkConditionEntry;

  //   const workCondition = _.concat(
  //     오픈_매점_2명,
  //     마감_매점_2명,
  //     오픈_플로어_2명,
  //     마감_플로어_2명,
  //     멀티_1명_오픈,
  //   ) as WorkConditionEntry[];

  //   mockSchedule[EDayOfWeek.월] = _.cloneDeep(workCondition) as ScheduleEntry[];

  //   const possible = new StaticEmployeeCondition(
  //     멀티_1명_마감,
  //     _.cloneDeep(userInputCondition.employeeConditions),
  //     {},
  //   )
  //     .add_조건1_직원의_가능한_포지션()
  //     .filter();

  //   const dynamicCondition = new DynamicEmployeeConditions(
  //     멀티_1명_마감,
  //     _.cloneDeep(possible),
  //     mockSchedule,
  //     100,
  //     mockScheduleEntryService,
  //     workCondition,
  //   );

  //   const filtered = await dynamicCondition
  //     .add_조건5_멀티_최소인원을_만족하는_근무자()
  //     .filter();

  //   expect(filtered.length).toEqual(floorOrMultiEmployees.length);
  // });
});
