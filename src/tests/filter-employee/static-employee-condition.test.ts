import { DateDay } from '@/entity/interface/DateDay';
import { StaticEmployeeCondition } from '@/feature/employee/with-schedule/static-employee-condition';
import { createMockEmployeeCondition } from '@/mock/factories/employeeFactory';
import { createMockWorkConditionEntry } from '@/mock/factories/workConditionEntryFactory';
import { describe, expect, test } from '@jest/globals';
import _ from 'lodash';

const mockPossibleEmployeesCache = {};

describe('정적 근무자 조건 필터링', () => {
  test('직원의 가능한 포지션', () => {
    const wCon1 = createMockWorkConditionEntry();
    const eCon1 = createMockEmployeeCondition();
    const eCon2 = createMockEmployeeCondition();

    eCon1.employee.ableWorkPosition = [];

    const staticCondition = new StaticEmployeeCondition(
      wCon1,
      _.cloneDeep(mockPossibleEmployeesCache),
      { '가능한 근무자': [eCon1, eCon2] },
    );

    const filtered = staticCondition.add_조건1_직원의_가능한_포지션().value();
    expect(filtered.length).toEqual(1);

    expect(filtered[0].employee.id).toEqual(eCon2.employee.id);
  });

  test('직원의 가능한 날', () => {
    const wCon1 = createMockWorkConditionEntry();
    const eCon1 = createMockEmployeeCondition();
    const eCon2 = createMockEmployeeCondition();

    eCon1.employee.ableWorkTime = {};

    const staticCondition = new StaticEmployeeCondition(
      wCon1,
      _.cloneDeep(mockPossibleEmployeesCache),
      { '가능한 근무자': [eCon1, eCon2] },
    );

    const filtered = staticCondition.add_조건2_직원의_가능한_시간().value();
    expect(filtered.length).toEqual(1);

    expect(filtered[0].employee.id).toEqual(eCon2.employee.id);
  });

  test('직원의_추가_휴무일', () => {
    const wCon1 = createMockWorkConditionEntry();
    const eCon1 = createMockEmployeeCondition();
    const eCon2 = createMockEmployeeCondition();

    eCon1.additionalUnableDayOff = [new DateDay(wCon1.date, 0).getDayOfWeek()];

    const staticCondition = new StaticEmployeeCondition(
      wCon1,
      _.cloneDeep(mockPossibleEmployeesCache),
      { '가능한 근무자': [eCon1, eCon2] },
    );

    const filtered = staticCondition.add_조건3_직원의_추가_휴무일().value();
    expect(filtered.length).toEqual(1);

    expect(filtered[0].employee.id).toEqual(eCon2.employee.id);
  });

  // test('모든 필터링', () => {
  //   const mockWorkConditionEntry: WorkConditionEntry = {
  //     workPosition: EWorkPosition.매점,
  //     dateDay: DateDay.fromDayOfWeek(startDate, EDayOfWeek.월),
  //     workTime: EWorkTime.오픈,
  //     timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
  //   };

  //   const staticCondition = new StaticEmployeeCondition(
  //     _.cloneDeep(mockWorkConditionEntry),
  //     _.cloneDeep(userInputCondition.employeeConditions),
  //     _.cloneDeep(mockPossibleEmployeesCache),
  //   );

  //   const filtered = staticCondition
  //     .add_조건1_직원의_가능한_포지션()
  //     .add_조건2_직원의_가능한_시간()
  //     .add_조건3_직원의_추가_휴무일()
  //     .filter();

  //   const expectValue = userInputCondition.employeeConditions.filter(
  //     ({ employee, additionalUnableDayOff }) => {
  //       return (
  //         employee.ableWorkPosition.includes(
  //           mockWorkConditionEntry.workPosition,
  //         ) &&
  //         mockWorkConditionEntry.dateDay.dayOfWeek in
  //           _.omitBy(employee.ableWorkTime, _.isUndefined) &&
  //         !additionalUnableDayOff.includes(
  //           mockWorkConditionEntry.dateDay.dayOfWeek,
  //         )
  //       );
  //     },
  //   ).length;

  //   expect(filtered.length).toEqual(expectValue);
  // });

  // test('캐시 확인', () => {
  //   const mockWorkConditionEntry: WorkConditionEntry = {
  //     workPosition: EWorkPosition.매점,
  //     dateDay: DateDay.fromDayOfWeek(startDate, EDayOfWeek.월),
  //     workTime: EWorkTime.오픈,
  //     timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
  //   };

  //   const staticCondition = new StaticEmployeeCondition(
  //     _.cloneDeep(mockWorkConditionEntry),
  //     _.cloneDeep(userInputCondition.employeeConditions),
  //     _.cloneDeep(mockPossibleEmployeesCache),
  //   );

  //   const filtered = staticCondition
  //     .add_조건1_직원의_가능한_포지션()
  //     .add_조건2_직원의_가능한_시간()
  //     .add_조건3_직원의_추가_휴무일()
  //     .filter();

  //   const filtered2 = staticCondition
  //     .add_조건1_직원의_가능한_포지션()
  //     .add_조건2_직원의_가능한_시간()
  //     .add_조건3_직원의_추가_휴무일()
  //     .filter();

  //   expect(filtered).toEqual(filtered2);
  // });

  // test('mockEmployeeConditions로 통합 테스트', async () => {
  //   const cache = {};
  //   const staticFilter = new StaticEmployeeCondition(
  //     {
  //       workPosition: EWorkPosition.매점,
  //       dateDay: DateDay.fromDayOfWeek(new Date(), EDayOfWeek.금),
  //       workTime: EWorkTime.마감,
  //       timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
  //     } as WorkConditionEntry,
  //     mockEmployeeConditions,
  //     cache,
  //   );

  //   const filtered = staticFilter
  //     .add_조건1_직원의_가능한_포지션()
  //     .add_조건2_직원의_가능한_시간()
  //     .add_조건3_직원의_추가_휴무일()
  //     .filter();

  //   const fact = mockEmployeeConditions.filter((eCon) => {
  //     return (
  //       EDayOfWeek.금 in eCon.employee.ableWorkTime &&
  //       eCon.employee.ableWorkTime[EDayOfWeek.금]?.includes(EWorkTime.마감) &&
  //       eCon.employee.ableWorkPosition.includes(EWorkPosition.매점) &&
  //       !eCon.additionalUnableDayOff.includes(EDayOfWeek.금)
  //     );
  //   });

  //   expect(filtered.length).toEqual(fact.length);
  // });
});
