jest.useFakeTimers();
import { EDAY_OF_WEEKS, EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { DateDay } from '@/entity/interface/DateDay';
import {
  EmployeeCondition,
  UserInputCondition,
  WorkConditionEntry,
  WorkConditionOfWeek,
} from '@/entity/types';
import { ScheduleGenerator } from '@/feature/schedule/schedule-generator';
import {
  floorOrMultiOn월Employees,
  mockEmployeeConditions,
  restEmployees,
} from '@/mock/employees';
import { userInputCondition } from '@/mock/user-input-condition';
import { describe, expect, jest, test } from '@jest/globals';
import _ from 'lodash';

const startDate = new Date('2024-11-28');
const startDateDay = new DateDay(startDate, 0);

const workConditionEntry = {
  dateDay: startDateDay,
  workPosition: EWorkPosition.매점,
  workTime: EWorkTime.오픈,
} as WorkConditionEntry;

const ableEmp = [
  {
    employee: {
      id: 1,
      ableWorkPosition: [EWorkPosition.매점],
      ableWorkTime: {
        [EDayOfWeek.월]: [EWorkTime.오픈],
      },
    },
    ableMinWorkCount: 1,
    ableMaxWorkCount: 2,
  },
  {
    employee: {
      id: 2,
      ableWorkPosition: [EWorkPosition.매점],
      ableWorkTime: {
        [EDayOfWeek.월]: [EWorkTime.오픈],
      },
    },
    ableMinWorkCount: 1,
    ableMaxWorkCount: 2,
  },
] as EmployeeCondition[];

describe('스케쥴 생성기 테스트', () => {
  test('인원이 적어 2초 동안 끝나지 않으면 isTimeOut true와 함께 끝난다.', async () => {
    jest.useFakeTimers();
    // when 인원이 1명이고 5초 동안 끝나지 않는다.

    // given 근무 배치가 각 요일에 3명씩
    const generator = new ScheduleGenerator(
      {} as UserInputCondition,
      1000 * 100,
    );

    generator.generate(1000 * 2);

    jest.advanceTimersByTime(2000); // Advance the timers by 2 seconds to trigger the timeout

    expect(generator.isTimeOut).toBeTruthy();

    jest.clearAllTimers();
  });

  test('totalWorkCnt 카운트 테스트', async () => {
    jest.useRealTimers();
    // when
    const generator = new ScheduleGenerator(
      {
        workConditionOfWeek: {
          월: [_.cloneDeep(workConditionEntry)],
        },
        employeeConditions: _.cloneDeep(ableEmp),
        maxWorkComboDayCount: 4,
      } as UserInputCondition,
      10,
    );

    expect(generator['totalWorkCnt']).toEqual(1);
  });

  test('매점 오픈엔 두명이 들어 갈수 있으므로 최대 경우의 수는 2개임', async () => {
    jest.useRealTimers();

    const mockUserInput = {
      startDateDay,
      workConditionOfWeek: {
        월: [_.cloneDeep(workConditionEntry)],
      },
      employeeConditions: _.cloneDeep(ableEmp),
      maxWorkComboDayCount: 4,
    } as UserInputCondition;

    const generator = new ScheduleGenerator(mockUserInput, 1000000);

    await generator.generate(10000);

    const result = generator.getResult();
    expect(result.length).toBe(2);
  });

  test('filtering 메서드 테스트', () => {
    const generator = new ScheduleGenerator(
      {
        workConditionOfWeek: {
          월: [_.cloneDeep(workConditionEntry)],
        },
        employeeConditions: _.cloneDeep(ableEmp),
        maxWorkComboDayCount: 4,
      } as UserInputCondition,
      10,
    );
    generator['filter_가능한_모든_근무자들'](workConditionEntry);
    expect(generator['possibleEmployees'].length).toEqual(2);
  });

  test('통합 테스트', async () => {
    jest.useRealTimers();

    const startDate = new Date('2024-11-25');

    const 다들어갈_아무나 = restEmployees[0];
    const 멀티_플로어_가능한_아무나 = floorOrMultiOn월Employees[0];

    const dateDay = DateDay.fromDayOfWeek(startDate, EDayOfWeek.월);

    const 오픈_매점_2명 = [1, 2].map(() => ({
      dateDay,
      employee: 다들어갈_아무나,
      workPosition: EWorkPosition.매점,
      workTime: EWorkTime.오픈,
    })) as WorkConditionEntry[];

    const 마감_매점_2명 = [1, 2].map(() => ({
      dateDay,
      employee: 다들어갈_아무나,
      workPosition: EWorkPosition.매점,
      workTime: EWorkTime.마감,
    })) as WorkConditionEntry[];

    const 오픈_플로어_2명 = [1, 2].map(() => ({
      dateDay,
      employee: 멀티_플로어_가능한_아무나,
      workPosition: EWorkPosition.플로어,
      workTime: EWorkTime.오픈,
    })) as WorkConditionEntry[];

    const 마감_플로어_2명 = [1, 2].map(() => ({
      dateDay,
      employee: 멀티_플로어_가능한_아무나,
      workPosition: EWorkPosition.플로어,
      workTime: EWorkTime.마감,
    })) as WorkConditionEntry[];

    const 멀티_1명_오픈 = {
      dateDay,
      employee: 멀티_플로어_가능한_아무나,
      workPosition: EWorkPosition.멀티,
      workTime: EWorkTime.오픈,
    } as WorkConditionEntry;

    const 멀티_1명_마감 = {
      dateDay,
      workPosition: EWorkPosition.멀티,
      workTime: EWorkTime.마감,
    } as WorkConditionEntry;

    const workCondition = _.concat(
      오픈_매점_2명,
      마감_매점_2명,
      오픈_플로어_2명,
      마감_플로어_2명,
      멀티_1명_오픈,
      멀티_1명_마감,
    ) as WorkConditionEntry[];

    const scheduleGenerator = new ScheduleGenerator(
      {
        ...userInputCondition,
        workConditionOfWeek: {
          [EDayOfWeek.월]: _.cloneDeep(workCondition),
        },
      },
      10000,
    );

    await scheduleGenerator.generate(5000);

    const result = scheduleGenerator.getResult();

    expect(result.length).toBe(floorOrMultiOn월Employees.length - 1);

    const _prettier = _.chain(result)
      .map((result) => {
        return _.chain(result)
          .toPairs()
          .map(([key1, result1]) => {
            return [
              key1,
              _.chain(result1)
                .map(({ workPosition, workTime, employee }) => [
                  `${workPosition} ${workTime}`,
                  employee?.name,
                ])
                .fromPairs()
                .value(),
            ];
          })
          .fromPairs()
          .value();
      })
      .value();

    // fs.writeFileSync('./c.json', JSON.stringify(prettier, null, 2));
  });

  test('통합 테스트2', async () => {
    jest.useRealTimers();

    const workConditions = Object.fromEntries(
      EDAY_OF_WEEKS.map((day) => [
        day,
        [
          {
            dateDay: DateDay.fromDayOfWeek(startDate, day),
            workPosition: EWorkPosition.매점,
            workTime: EWorkTime.오픈,
          },
          {
            dateDay: DateDay.fromDayOfWeek(startDate, day),
            workPosition: EWorkPosition.매점,
            workTime: EWorkTime.마감,
          },
          {
            dateDay: DateDay.fromDayOfWeek(startDate, day),
            workPosition: EWorkPosition.플로어,
            workTime: EWorkTime.오픈,
          },
          {
            dateDay: DateDay.fromDayOfWeek(startDate, day),
            workPosition: EWorkPosition.플로어,
            workTime: EWorkTime.마감,
          },
        ],
      ]),
    ) as WorkConditionOfWeek;

    const generator = new ScheduleGenerator(
      {
        employeeConditions: mockEmployeeConditions,
        startDateDay,
        maxWorkComboDayCount: 3,
        workConditionOfWeek: workConditions,
      },
      1,
    );

    generator.generate(500000);

    const result = generator.getResult();

    expect(result.length).toBe(1);

    expect(_.map(result[0], (o) => _.size(o))).toBe(
      _.map(workConditions, (o) => _.size(o)),
    );
  });
});
