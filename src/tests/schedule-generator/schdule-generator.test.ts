jest.useFakeTimers();
import { Employee } from '@/entity/employee.entity';
import { EmployeeCondition, UserInputCondition } from '@/entity/types';
import { ScheduleGenerator } from '@/feature/schedule/schedule-generator';
import { describe, expect, jest, test } from '@jest/globals';
import fs from 'fs';

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

  test('실제값 있는지 테스트', async () => {
    jest.useRealTimers();

    const realData = JSON.parse(
      fs.readFileSync('./src/mock/employees.json').toString(),
    ) as Employee[];

    expect(realData).toBeTruthy();
    // realData.
  });

  test('실제 값으로 테스트', async () => {
    jest.useRealTimers();

    const employees = JSON.parse(
      fs.readFileSync('./src/mock/employees.json').toString(),
    ) as Employee[];
    const userInput = {
      employeeConditions: [
        {
          ableMinWorkCount: 1,
          ableMaxWorkCount: 4,
          additionalUnableDayOff: [],
          employee: {
            id: 14,
          },
        },
        {
          ableMinWorkCount: 1,
          ableMaxWorkCount: 4,
          additionalUnableDayOff: [],
          employee: {
            id: 13,
          },
        },
        {
          ableMinWorkCount: 1,
          ableMaxWorkCount: 4,
          additionalUnableDayOff: [],
          employee: {
            id: 12,
          },
        },
        {
          ableMinWorkCount: 1,
          ableMaxWorkCount: 4,
          additionalUnableDayOff: [],
          employee: {
            id: 11,
          },
        },
        {
          ableMinWorkCount: 1,
          ableMaxWorkCount: 4,
          additionalUnableDayOff: [],
          employee: {
            id: 10,
          },
        },
        {
          ableMinWorkCount: 1,
          ableMaxWorkCount: 4,
          additionalUnableDayOff: [],
          employee: {
            id: 9,
          },
        },
        {
          ableMinWorkCount: 1,
          ableMaxWorkCount: 4,
          additionalUnableDayOff: [],
          employee: {
            id: 8,
          },
        },
        {
          ableMinWorkCount: 1,
          ableMaxWorkCount: 4,
          additionalUnableDayOff: [],
          employee: {
            id: 7,
          },
        },
        {
          ableMinWorkCount: 1,
          ableMaxWorkCount: 4,
          additionalUnableDayOff: [],
          employee: {
            id: 6,
          },
        },
        {
          ableMinWorkCount: 1,
          ableMaxWorkCount: 4,
          additionalUnableDayOff: [],
          employee: {
            id: 5,
          },
        },
        {
          ableMinWorkCount: 1,
          ableMaxWorkCount: 4,
          additionalUnableDayOff: [],
          employee: {
            id: 4,
          },
        },
        {
          ableMinWorkCount: 1,
          ableMaxWorkCount: 4,
          additionalUnableDayOff: [],
          employee: {
            id: 3,
          },
        },
      ],
      maxWorkComboDayCount: 3,
      startDate: new Date('2024-12-05T01:17:51.901Z'),
      maxSchedule: 5,
      workConditionOfWeek: {
        목: [
          {
            id: 1,
            dateDay: {
              date: '2024-12-05T01:17:51.901Z',
              dayOfWeek: '목',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '매점',
            workTime: '오픈',
            timeSlot: {
              start: '8:30',
              end: '16:30',
            },
          },
          {
            id: 2,
            dateDay: {
              date: '2024-12-05T01:17:51.901Z',
              dayOfWeek: '목',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '매점',
            workTime: '마감',
            timeSlot: {
              start: '16:30',
              end: '24:00',
            },
          },
          {
            id: 3,
            dateDay: {
              date: '2024-12-05T01:17:51.901Z',
              dayOfWeek: '목',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '플로어',
            workTime: '오픈',
            timeSlot: {
              start: '8:30',
              end: '16:30',
            },
          },
          {
            id: 4,
            dateDay: {
              date: '2024-12-05T01:17:51.901Z',
              dayOfWeek: '목',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '플로어',
            workTime: '마감',
            timeSlot: {
              start: '16:30',
              end: '24:00',
            },
          },
        ],
        금: [
          {
            id: 5,
            dateDay: {
              date: '2024-12-06T01:17:51.901Z',
              dayOfWeek: '금',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '매점',
            workTime: '오픈',
            timeSlot: {
              start: '8:30',
              end: '16:30',
            },
          },
          {
            id: 6,
            dateDay: {
              date: '2024-12-06T01:17:51.901Z',
              dayOfWeek: '금',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '매점',
            workTime: '마감',
            timeSlot: {
              start: '16:30',
              end: '24:00',
            },
          },
          {
            id: 7,
            dateDay: {
              date: '2024-12-06T01:17:51.901Z',
              dayOfWeek: '금',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '플로어',
            workTime: '오픈',
            timeSlot: {
              start: '8:30',
              end: '16:30',
            },
          },
          {
            id: 8,
            dateDay: {
              date: '2024-12-06T01:17:51.901Z',
              dayOfWeek: '금',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '플로어',
            workTime: '마감',
            timeSlot: {
              start: '16:30',
              end: '24:00',
            },
          },
        ],
        토: [
          {
            id: 9,
            dateDay: {
              date: '2024-12-07T01:17:51.901Z',
              dayOfWeek: '토',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '매점',
            workTime: '오픈',
            timeSlot: {
              start: '8:30',
              end: '16:30',
            },
          },
          {
            id: 10,
            dateDay: {
              date: '2024-12-07T01:17:51.901Z',
              dayOfWeek: '토',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '매점',
            workTime: '마감',
            timeSlot: {
              start: '16:30',
              end: '24:00',
            },
          },
          {
            id: 11,
            dateDay: {
              date: '2024-12-07T01:17:51.901Z',
              dayOfWeek: '토',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '플로어',
            workTime: '오픈',
            timeSlot: {
              start: '8:30',
              end: '16:30',
            },
          },
          {
            id: 12,
            dateDay: {
              date: '2024-12-07T01:17:51.901Z',
              dayOfWeek: '토',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '플로어',
            workTime: '마감',
            timeSlot: {
              start: '16:30',
              end: '24:00',
            },
          },
        ],
        일: [
          {
            id: 13,
            dateDay: {
              date: '2024-12-08T01:17:51.901Z',
              dayOfWeek: '일',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '매점',
            workTime: '오픈',
            timeSlot: {
              start: '8:30',
              end: '16:30',
            },
          },
          {
            id: 14,
            dateDay: {
              date: '2024-12-08T01:17:51.901Z',
              dayOfWeek: '일',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '매점',
            workTime: '마감',
            timeSlot: {
              start: '16:30',
              end: '24:00',
            },
          },
          {
            id: 15,
            dateDay: {
              date: '2024-12-08T01:17:51.901Z',
              dayOfWeek: '일',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '플로어',
            workTime: '오픈',
            timeSlot: {
              start: '8:30',
              end: '16:30',
            },
          },
          {
            id: 16,
            dateDay: {
              date: '2024-12-08T01:17:51.901Z',
              dayOfWeek: '일',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '플로어',
            workTime: '마감',
            timeSlot: {
              start: '16:30',
              end: '24:00',
            },
          },
        ],
        월: [
          {
            id: 17,
            dateDay: {
              date: '2024-12-09T01:17:51.901Z',
              dayOfWeek: '월',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '매점',
            workTime: '오픈',
            timeSlot: {
              start: '8:30',
              end: '16:30',
            },
          },
          {
            id: 18,
            dateDay: {
              date: '2024-12-09T01:17:51.901Z',
              dayOfWeek: '월',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '매점',
            workTime: '마감',
            timeSlot: {
              start: '16:30',
              end: '24:00',
            },
          },
          {
            id: 19,
            dateDay: {
              date: '2024-12-09T01:17:51.901Z',
              dayOfWeek: '월',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '플로어',
            workTime: '오픈',
            timeSlot: {
              start: '8:30',
              end: '16:30',
            },
          },
          {
            id: 20,
            dateDay: {
              date: '2024-12-09T01:17:51.901Z',
              dayOfWeek: '월',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '플로어',
            workTime: '마감',
            timeSlot: {
              start: '16:30',
              end: '24:00',
            },
          },
        ],
        화: [
          {
            id: 21,
            dateDay: {
              date: '2024-12-10T01:17:51.901Z',
              dayOfWeek: '화',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '매점',
            workTime: '오픈',
            timeSlot: {
              start: '8:30',
              end: '16:30',
            },
          },
          {
            id: 22,
            dateDay: {
              date: '2024-12-10T01:17:51.901Z',
              dayOfWeek: '화',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '매점',
            workTime: '마감',
            timeSlot: {
              start: '16:30',
              end: '24:00',
            },
          },
          {
            id: 23,
            dateDay: {
              date: '2024-12-10T01:17:51.901Z',
              dayOfWeek: '화',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '플로어',
            workTime: '오픈',
            timeSlot: {
              start: '8:30',
              end: '16:30',
            },
          },
          {
            id: 24,
            dateDay: {
              date: '2024-12-10T01:17:51.901Z',
              dayOfWeek: '화',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '플로어',
            workTime: '마감',
            timeSlot: {
              start: '16:30',
              end: '24:00',
            },
          },
        ],
        수: [
          {
            id: 25,
            dateDay: {
              date: '2024-12-11T01:17:51.901Z',
              dayOfWeek: '수',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '매점',
            workTime: '오픈',
            timeSlot: {
              start: '8:30',
              end: '16:30',
            },
          },
          {
            id: 26,
            dateDay: {
              date: '2024-12-11T01:17:51.901Z',
              dayOfWeek: '수',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '매점',
            workTime: '마감',
            timeSlot: {
              start: '16:30',
              end: '24:00',
            },
          },
          {
            id: 27,
            dateDay: {
              date: '2024-12-11T01:17:51.901Z',
              dayOfWeek: '수',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '플로어',
            workTime: '오픈',
            timeSlot: {
              start: '8:30',
              end: '16:30',
            },
          },
          {
            id: 28,
            dateDay: {
              date: '2024-12-11T01:17:51.901Z',
              dayOfWeek: '수',
              startDate: '2024-12-05T01:17:51.901Z',
            },
            workPosition: '플로어',
            workTime: '마감',
            timeSlot: {
              start: '16:30',
              end: '24:00',
            },
          },
        ],
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    userInput.employeeConditions = userInput.employeeConditions.map(
      (e: { employee: { id: number } }) => ({
        ...e,
        employee: employees.find((emp) => emp.id === e.employee.id),
      }),
    ) as EmployeeCondition[];

    const generator = new ScheduleGenerator(userInput as UserInputCondition, 1);

    await generator.generate(1000 * 5);

    const result = generator.getResult();

    expect(result.length).toBeGreaterThan(0);
  });

  // test('totalWorkCnt 카운트 테스트', async () => {
  //   jest.useRealTimers();
  //   const ableEmp = [
  //     {
  //       employee: {
  //         id: 1,
  //         ableWorkPosition: [EWorkPosition.매점],
  //         ableWorkTime: {
  //           [EDayOfWeek.월]: [EWorkTime.오픈],
  //         },
  //       },
  //       ableMinWorkCount: 0,
  //       ableMaxWorkCount: 2,
  //     },
  //     {
  //       employee: {
  //         id: 2,
  //         ableWorkPosition: [EWorkPosition.매점],
  //         ableWorkTime: {
  //           [EDayOfWeek.월]: [EWorkTime.오픈],
  //         },
  //       },
  //       ableMinWorkCount: 0,
  //       ableMaxWorkCount: 2,
  //     },
  //   ] as EmployeeCondition[];

  //   // when
  //   const generator = new ScheduleGenerator(
  //     {
  //       workConditionOfWeek: {
  //         월: [_.cloneDeep(workConditionEntry)],
  //       },
  //       employeeConditions: _.cloneDeep(ableEmp),
  //       maxWorkComboDayCount: 4,
  //     } as UserInputCondition,
  //     10,
  //   );

  //   expect(generator['totalWorkCnt']).toEqual(1);
  // });

  // test('매점 오픈엔 두명이 들어 갈수 있으므로 최대 경우의 수는 2개임', async () => {
  //   jest.useRealTimers();

  //   const ableEmp = [
  //     {
  //       employee: {
  //         id: 1,
  //         ableWorkPosition: [EWorkPosition.매점],
  //         ableWorkTime: {
  //           [EDayOfWeek.월]: [EWorkTime.오픈],
  //         },
  //       },
  //       ableMinWorkCount: 0,
  //       ableMaxWorkCount: 2,
  //     },
  //     {
  //       employee: {
  //         id: 2,
  //         ableWorkPosition: [EWorkPosition.매점],
  //         ableWorkTime: {
  //           [EDayOfWeek.월]: [EWorkTime.오픈],
  //         },
  //       },
  //       ableMinWorkCount: 0,
  //       ableMaxWorkCount: 2,
  //     },
  //   ] as EmployeeCondition[];

  //   const mockUserInput = {
  //     startDateDay: DateDay.fromDayOfWeek(startDate, EDayOfWeek.월),
  //     workConditionOfWeek: {
  //       월: [_.cloneDeep(workConditionEntry)],
  //     },
  //     employeeConditions: _.cloneDeep(ableEmp),
  //     maxWorkComboDayCount: 4,
  //   } as UserInputCondition;

  //   const generator = new ScheduleGenerator(mockUserInput, 1000000);

  //   await generator.generate(1000 * 60 * 5);

  //   const result = generator.getResult();
  //   expect(result.length).toBe(2);
  // });

  // test('filtering 메서드 테스트', () => {
  //   const ableEmp = [
  //     {
  //       employee: {
  //         id: 1,
  //         ableWorkPosition: [EWorkPosition.매점],
  //         ableWorkTime: {
  //           [EDayOfWeek.월]: [EWorkTime.오픈],
  //         },
  //       },
  //       ableMinWorkCount: 0,
  //       ableMaxWorkCount: 2,
  //     },
  //     {
  //       employee: {
  //         id: 2,
  //         ableWorkPosition: [EWorkPosition.매점],
  //         ableWorkTime: {
  //           [EDayOfWeek.월]: [EWorkTime.오픈],
  //         },
  //       },
  //       ableMinWorkCount: 0,
  //       ableMaxWorkCount: 2,
  //     },
  //   ] as EmployeeCondition[];
  //   const generator = new ScheduleGenerator(
  //     {
  //       workConditionOfWeek: {
  //         월: [_.cloneDeep(workConditionEntry)],
  //       },
  //       employeeConditions: _.cloneDeep(ableEmp),
  //       maxWorkComboDayCount: 4,
  //     } as UserInputCondition,
  //     10,
  //   );
  //   generator['filter_가능한_모든_근무자들'](workConditionEntry);
  //   expect(generator['possibleEmployees'].length).toEqual(2);
  // });
});
