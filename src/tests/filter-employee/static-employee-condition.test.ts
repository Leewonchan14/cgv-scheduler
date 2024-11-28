import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { DateDay } from '@/entity/interface/DateDay';
import { WorkConditionEntry } from '@/entity/types';
import { StaticEmployeeCondition } from '@/feature/employee/with-schedule/static-employee-condition';
import { WorkTimeSlot } from '@/feature/schedule/work-time-slot-handler';
import { mockEmployeeConditions } from '@/mock/employees';
import { userInputCondition } from '@/mock/user-input-condition';
import { describe, expect, test } from '@jest/globals';
import _ from 'lodash';

const mockPossibleEmployeesCache = {};

const startDate = new Date('2024-11-25');

describe('정적 근무자 조건 필터링', () => {
  test('직원의 가능한 포지션', () => {
    const mockWorkConditionEntry: WorkConditionEntry = {
      workPosition: EWorkPosition.매점,
      dateDay: DateDay.fromDayOfWeek(startDate, EDayOfWeek.월),
      workTime: EWorkTime.오픈,
      timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
    };

    const staticCondition = new StaticEmployeeCondition(
      _.cloneDeep(mockWorkConditionEntry),
      _.cloneDeep(userInputCondition.employeeConditions),
      _.cloneDeep(mockPossibleEmployeesCache),
    );

    const filtered = staticCondition.add_조건1_직원의_가능한_포지션().filter();

    const expectValue = userInputCondition.employeeConditions.filter(
      ({ employee }) => {
        return employee.ableWorkPosition.includes(
          mockWorkConditionEntry.workPosition,
        );
      },
    ).length;

    expect(filtered.length).toEqual(expectValue);
  });

  test('직원의 가능한 날', () => {
    const mockWorkConditionEntry: WorkConditionEntry = {
      dateDay: DateDay.fromDayOfWeek(startDate, EDayOfWeek.월),
      workPosition: EWorkPosition.매점,
      workTime: EWorkTime.오픈,
      timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
    };

    const staticCondition = new StaticEmployeeCondition(
      _.cloneDeep(mockWorkConditionEntry),
      _.cloneDeep(userInputCondition.employeeConditions),
      _.cloneDeep(mockPossibleEmployeesCache),
    );

    const filtered = staticCondition.add_조건2_직원의_가능한_시간().filter();

    const 월요일이_가능한_근무자인원 =
      userInputCondition.employeeConditions.filter(({ employee }) => {
        const dayOfWeek = mockWorkConditionEntry.dateDay.dayOfWeek;

        const ableWorkTime = employee.ableWorkTime;
        return (
          dayOfWeek in _.omitBy(ableWorkTime, _.isUndefined) &&
          ableWorkTime[dayOfWeek]?.includes(mockWorkConditionEntry.workTime)
        );
      }).length;

    expect(filtered.length).toEqual(월요일이_가능한_근무자인원);
  });

  test('직원의_추가_휴무일', () => {
    const mockWorkConditionEntry: WorkConditionEntry = {
      dateDay: DateDay.fromDayOfWeek(startDate, EDayOfWeek.월),
      workPosition: EWorkPosition.매점,
      workTime: EWorkTime.오픈,
      timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
    };

    const empConditions = _.cloneDeep(userInputCondition.employeeConditions);

    _.merge(empConditions[0], {
      additionalUnableDayOff: [EDayOfWeek.월],
    });

    const staticCondition = new StaticEmployeeCondition(
      _.cloneDeep(mockWorkConditionEntry),
      _.cloneDeep(empConditions),
      _.cloneDeep(mockPossibleEmployeesCache),
    );

    const filtered = staticCondition.add_조건3_직원의_추가_휴무일().filter();

    expect(filtered.length).toEqual(
      userInputCondition.employeeConditions.length - 1,
    );
  });

  test('모든 필터링', () => {
    const mockWorkConditionEntry: WorkConditionEntry = {
      workPosition: EWorkPosition.매점,
      dateDay: DateDay.fromDayOfWeek(startDate, EDayOfWeek.월),
      workTime: EWorkTime.오픈,
      timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
    };

    const staticCondition = new StaticEmployeeCondition(
      _.cloneDeep(mockWorkConditionEntry),
      _.cloneDeep(userInputCondition.employeeConditions),
      _.cloneDeep(mockPossibleEmployeesCache),
    );

    const filtered = staticCondition
      .add_조건1_직원의_가능한_포지션()
      .add_조건2_직원의_가능한_시간()
      .add_조건3_직원의_추가_휴무일()
      .filter();

    const expectValue = userInputCondition.employeeConditions.filter(
      ({ employee, additionalUnableDayOff }) => {
        return (
          employee.ableWorkPosition.includes(
            mockWorkConditionEntry.workPosition,
          ) &&
          mockWorkConditionEntry.dateDay.dayOfWeek in
            _.omitBy(employee.ableWorkTime, _.isUndefined) &&
          !additionalUnableDayOff.includes(
            mockWorkConditionEntry.dateDay.dayOfWeek,
          )
        );
      },
    ).length;

    expect(filtered.length).toEqual(expectValue);
  });

  test('캐시 확인', () => {
    const mockWorkConditionEntry: WorkConditionEntry = {
      workPosition: EWorkPosition.매점,
      dateDay: DateDay.fromDayOfWeek(startDate, EDayOfWeek.월),
      workTime: EWorkTime.오픈,
      timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
    };

    const staticCondition = new StaticEmployeeCondition(
      _.cloneDeep(mockWorkConditionEntry),
      _.cloneDeep(userInputCondition.employeeConditions),
      _.cloneDeep(mockPossibleEmployeesCache),
    );

    const filtered = staticCondition
      .add_조건1_직원의_가능한_포지션()
      .add_조건2_직원의_가능한_시간()
      .add_조건3_직원의_추가_휴무일()
      .filter();

    const filtered2 = staticCondition
      .add_조건1_직원의_가능한_포지션()
      .add_조건2_직원의_가능한_시간()
      .add_조건3_직원의_추가_휴무일()
      .filter();

    expect(filtered).toEqual(filtered2);
  });

  test('mockEmployeeConditions로 통합 테스트', async () => {
    const cache = {};
    const staticFilter = new StaticEmployeeCondition(
      {
        workPosition: EWorkPosition.매점,
        dateDay: DateDay.fromDayOfWeek(new Date(), EDayOfWeek.금),
        workTime: EWorkTime.마감,
        timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
      } as WorkConditionEntry,
      mockEmployeeConditions,
      cache,
    );

    const filtered = staticFilter
      .add_조건1_직원의_가능한_포지션()
      .add_조건2_직원의_가능한_시간()
      .add_조건3_직원의_추가_휴무일()
      .filter();

    const fact = mockEmployeeConditions.filter((eCon) => {
      return (
        EDayOfWeek.금 in eCon.employee.ableWorkTime &&
        eCon.employee.ableWorkTime[EDayOfWeek.금]?.includes(EWorkTime.마감) &&
        eCon.employee.ableWorkPosition.includes(EWorkPosition.매점) &&
        !eCon.additionalUnableDayOff.includes(EDayOfWeek.금)
      );
    });

    expect(filtered.length).toEqual(fact.length);
  });
});
