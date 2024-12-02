import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { DateDay } from '@/entity/interface/DateDay';
import { ScheduleEntry } from '@/entity/schedule-entry.entity';
import { WorkConditionOfWeekSchema } from '@/entity/types';
import { DynamicEmployeeConditions } from '@/feature/employee/with-schedule/dynamic-employee-condition';
import { ScheduleCounter } from '@/feature/schedule/schedule-counter';
import { IScheduleEntryService } from '@/feature/schedule/schedule-entry.service';
import { createMockEmployeeCondition } from '@/mock/factories/employeeFactory';
import { createMockEmptySchedule } from '@/mock/factories/scheduleFactory';
import { createMockWorkConditionEntry } from '@/mock/factories/workConditionEntryFactory';
import { describe, expect, test } from '@jest/globals';

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

    const dateDay = new DateDay(wCon1.date, 0);

    const dayOfWeek = dateDay.getDayOfWeek();

    // when: 요일에 a 가 schedule에 투입되어있고 b는 이미 workCondition에 투입되어있는 상태
    wCon1.employee = aCon.employee;
    wCon2.employee = bCon.employee;
    mockSchedule[dayOfWeek].push(wCon1 as ScheduleEntry);

    const workConditionOfDay = [wCon1, wCon2, wCon3];

    const workConditionOfWeek = WorkConditionOfWeekSchema.parse({
      [dayOfWeek as EDayOfWeek]: workConditionOfDay,
    });
    // then: a, b는 제외되어야함, c만 가능해야함
    const dynamicCondition = new DynamicEmployeeConditions(
      wCon3,
      mockSchedule,
      mockScheduleEntryService,
      new ScheduleCounter(workConditionOfWeek),
      {
        maxWorkComboDayCount: 100,
        workConditionOfWeek,
        startDate: wCon1.date,
      },
      { '가능한 근무자': [aCon, bCon, cCon] },
    );

    const filtered = await dynamicCondition
      .add_조건1_현재_요일에_투입_안된_근무자()
      .value();

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

    const dateDay = new DateDay(wCon1.date, 0);

    const dayOfWeek = dateDay.getDayOfWeek();

    wCon1.employee = eCon1.employee;
    wCon2.employee = eCon1.employee;

    mockSchedule[dayOfWeek].push(
      wCon1 as ScheduleEntry,
      wCon2 as ScheduleEntry,
    );

    const workConditionOfWeek = WorkConditionOfWeekSchema.parse({
      [dayOfWeek]: [wCon1, wCon2, wCon3],
    });

    // then: 3번째에서는 제외되어야함

    const dynamicCondition = new DynamicEmployeeConditions(
      wCon3,
      mockSchedule,
      mockScheduleEntryService,
      new ScheduleCounter(workConditionOfWeek),
      {
        startDate: wCon1.date,
        workConditionOfWeek,
        maxWorkComboDayCount: 100,
      },
      { '가능한 근무자': [eCon1] },
    );

    const filtered = await dynamicCondition
      .add_조건2_직원의_근무_최대_가능_일수를_안넘는_근무자()
      .value();

    expect(filtered.length).toEqual(0);
  });

  test('filter_전날_마감_근무후_다음날_오픈_근무가_아닌_근무자', async () => {
    const schedule = createMockEmptySchedule();
    const wCon1 = createMockWorkConditionEntry();
    const wCon2 = createMockWorkConditionEntry();

    const dateDay = new DateDay(wCon1.date, 0);
    const dayOfWeek = dateDay.getDayOfWeek();

    // 전날 마감, 다음날 오픈
    wCon1.workTime = EWorkTime.마감;
    wCon2.workTime = EWorkTime.오픈;
    wCon2.date = dateDay.getNextDateDay(1).date;

    schedule[dayOfWeek].push(wCon1 as ScheduleEntry);

    const aCon1 = createMockEmployeeCondition();
    wCon1.employee = aCon1.employee;

    const workConditionOfWeek = WorkConditionOfWeekSchema.parse({
      [dayOfWeek]: [wCon1, wCon2],
    });

    const dynamicCondition = new DynamicEmployeeConditions(
      wCon2,
      schedule,
      mockScheduleEntryService,
      new ScheduleCounter(workConditionOfWeek),
      {
        startDate: dateDay.startDate,
        workConditionOfWeek,
        maxWorkComboDayCount: 100,
      },
      { '가능한 근무자': [aCon1] },
    );

    const filtered = await dynamicCondition
      .add_조건3_전날_마감_근무후_다음날_오픈_근무가_아닌_근무자()
      .value();

    expect(filtered.length).toEqual(0);
  });

  test('filter_최대_연속_근무일수를_안넘는_근무자', async () => {
    //when: 최대 연속일이 2일 이라 했을때
    const 최대_연속일 = 2;

    const mockSchedule = createMockEmptySchedule();
    const wCon1 = createMockWorkConditionEntry();

    const dateDay = new DateDay(wCon1.date, 0);

    const dateDay1 = dateDay;
    const dateDay2 = dateDay.getNextDateDay(1);
    const dateDay3 = dateDay.getNextDateDay(2);

    const wCon2 = createMockWorkConditionEntry({ date: dateDay2.date });
    const wCon3 = createMockWorkConditionEntry({ date: dateDay3.date });

    const eCon1 = createMockEmployeeCondition();

    //given: 월,화요일에 아무근무자1,2 가 투입되어있는 상태
    wCon1.employee = eCon1.employee;
    wCon2.employee = eCon1.employee;
    mockSchedule[dateDay1.dayOfWeek].push(wCon1 as ScheduleEntry);
    mockSchedule[dateDay2.dayOfWeek].push(wCon2 as ScheduleEntry);

    const workConditionOfWeek = WorkConditionOfWeekSchema.parse({
      [dateDay1.dayOfWeek]: [wCon1],
      [dateDay2.dayOfWeek]: [wCon2],
      [dateDay3.dayOfWeek]: [wCon3],
    });

    const dynamicCondition = new DynamicEmployeeConditions(
      wCon3,
      mockSchedule,
      mockScheduleEntryService,
      new ScheduleCounter(workConditionOfWeek),
      {
        startDate: dateDay1.date,
        workConditionOfWeek,
        maxWorkComboDayCount: 최대_연속일,
      },
      { '가능한 근무자': [eCon1] },
    );

    //then: 가능한 근무자는 2명 빠져야함
    const filtered = await dynamicCondition
      .add_조건4_최대_연속_근무일수를_안넘는_근무자()
      .value();

    expect(filtered.length).toEqual(0);
  });

  test('멀티가 없을땐 필터링 되지 않음', async () => {
    // 멀티가 안되는 근무자
    const mockSchedule = createMockEmptySchedule();

    const eCon1 = createMockEmployeeCondition({
      employee: { ableWorkPosition: [EWorkPosition.매점] },
    });

    expect(eCon1.employee.ableWorkPosition).not.toContain(EWorkPosition.멀티);
    expect(eCon1.employee.ableWorkPosition).not.toContain(EWorkPosition.플로어);

    const wCon1 = createMockWorkConditionEntry({
      employee: eCon1.employee,
      workPosition: EWorkPosition.플로어,
    });
    const wCon2 = createMockWorkConditionEntry({
      employee: eCon1.employee,
      workPosition: EWorkPosition.플로어,
    });

    const wCon3 = createMockWorkConditionEntry({
      workPosition: EWorkPosition.플로어,
    });

    const dateDay = new DateDay(wCon1.date, 0);

    mockSchedule[dateDay.getDayOfWeek()].push(
      wCon1 as ScheduleEntry,
      wCon2 as ScheduleEntry,
    );

    const workConditionOfWeek = WorkConditionOfWeekSchema.parse({
      [dateDay.getDayOfWeek()]: [wCon1, wCon2, wCon3],
    });

    //when: 최대 멀티 조건 인원이 3명이라 했을때
    // TODO 입력받게 해야함 userInputCondition에서
    const _최대_멀티_인원 = 3;

    const dynamicCondition = new DynamicEmployeeConditions(
      wCon3,
      mockSchedule,
      mockScheduleEntryService,
      new ScheduleCounter(workConditionOfWeek),
      {
        maxWorkComboDayCount: 3,
        workConditionOfWeek,
        startDate: dateDay.startDate,
      },
      { '가능한 근무자': [eCon1] },
    );

    //then: 멀티가 없으므로 필터링 되지 않아야함
    const filtered = await dynamicCondition
      .add_조건5_멀티_최소인원을_만족하는_근무자()
      .value();

    expect(filtered.length).toEqual(1);
  });

  test('멀티가 있을때 필터링 된다.', async () => {
    const mockSchedule = createMockEmptySchedule();

    //멀티가 안되는 근무자
    const eCon1 = createMockEmployeeCondition({
      employee: {
        ableWorkPosition: [EWorkPosition.매점, EWorkPosition.플로어],
      },
    });

    expect(eCon1.employee.ableWorkPosition).not.toContain(EWorkPosition.멀티);

    const wCon1 = createMockWorkConditionEntry({
      employee: eCon1.employee,
      workPosition: EWorkPosition.플로어,
    });

    const wCon3 = createMockWorkConditionEntry({
      workPosition: EWorkPosition.멀티,
    });

    const dateDay = new DateDay(wCon1.date, 0);

    mockSchedule[dateDay.getDayOfWeek()].push(wCon1 as ScheduleEntry);

    const workConditionOfWeek = WorkConditionOfWeekSchema.parse({
      [dateDay.getDayOfWeek()]: [wCon1, wCon3],
    });
    //when: 최대 멀티 조건 인원이 3명이라 했을때
    const 최대_멀티_인원 = 3;

    const dynamicCondition = new DynamicEmployeeConditions(
      wCon3,
      mockSchedule,
      mockScheduleEntryService,
      new ScheduleCounter(workConditionOfWeek),
      {
        startDate: dateDay.startDate,
        workConditionOfWeek,
        maxWorkComboDayCount: 최대_멀티_인원,
      },
      { '가능한 근무자': [eCon1] },
    );

    //then: 멀티가 없으므로 필터링 되지 않아야함
    const filtered = await dynamicCondition
      .add_조건5_멀티_최소인원을_만족하는_근무자()
      .value();

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
