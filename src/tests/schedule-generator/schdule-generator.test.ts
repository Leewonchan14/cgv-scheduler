// jest.useFakeTimers();
// import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
// import { EWorkPosition } from '@/entity/enums/EWorkPosition';
// import { EWorkTime } from '@/entity/enums/EWorkTime';
// import { DateDay } from '@/entity/interface/DateDay';
// import {
//   EmployeeCondition,
//   UserInputCondition,
//   WorkConditionEntry,
// } from '@/entity/types';
// import { ScheduleGenerator } from '@/feature/schedule/schedule-generator';
// import { WorkTimeSlot } from '@/feature/schedule/work-time-slot-handler';
// import { describe, expect, jest, test } from '@jest/globals';
// import _ from 'lodash';

// const startDate = new Date('2024-11-28');

// const workConditionEntry = {
//   dateDay: DateDay.fromDayOfWeek(startDate, EDayOfWeek.월),
//   workPosition: EWorkPosition.매점,
//   workTime: EWorkTime.오픈,
//   timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
// } as WorkConditionEntry;

// describe('스케쥴 생성기 테스트', () => {
//   test('인원이 적어 2초 동안 끝나지 않으면 isTimeOut true와 함께 끝난다.', async () => {
//     jest.useFakeTimers();
//     // when 인원이 1명이고 5초 동안 끝나지 않는다.

//     // given 근무 배치가 각 요일에 3명씩
//     const generator = new ScheduleGenerator(
//       {} as UserInputCondition,
//       1000 * 100,
//     );

//     generator.generate(1000 * 2);

//     jest.advanceTimersByTime(2000); // Advance the timers by 2 seconds to trigger the timeout

//     expect(generator.isTimeOut).toBeTruthy();

//     jest.clearAllTimers();
//   });

//   test('totalWorkCnt 카운트 테스트', async () => {
//     jest.useRealTimers();
//     const ableEmp = [
//       {
//         employee: {
//           id: 1,
//           ableWorkPosition: [EWorkPosition.매점],
//           ableWorkTime: {
//             [EDayOfWeek.월]: [EWorkTime.오픈],
//           },
//         },
//         ableMinWorkCount: 0,
//         ableMaxWorkCount: 2,
//       },
//       {
//         employee: {
//           id: 2,
//           ableWorkPosition: [EWorkPosition.매점],
//           ableWorkTime: {
//             [EDayOfWeek.월]: [EWorkTime.오픈],
//           },
//         },
//         ableMinWorkCount: 0,
//         ableMaxWorkCount: 2,
//       },
//     ] as EmployeeCondition[];

//     // when
//     const generator = new ScheduleGenerator(
//       {
//         workConditionOfWeek: {
//           월: [_.cloneDeep(workConditionEntry)],
//         },
//         employeeConditions: _.cloneDeep(ableEmp),
//         maxWorkComboDayCount: 4,
//       } as UserInputCondition,
//       10,
//     );

//     expect(generator['totalWorkCnt']).toEqual(1);
//   });

//   test('매점 오픈엔 두명이 들어 갈수 있으므로 최대 경우의 수는 2개임', async () => {
//     jest.useRealTimers();

//     const ableEmp = [
//       {
//         employee: {
//           id: 1,
//           ableWorkPosition: [EWorkPosition.매점],
//           ableWorkTime: {
//             [EDayOfWeek.월]: [EWorkTime.오픈],
//           },
//         },
//         ableMinWorkCount: 0,
//         ableMaxWorkCount: 2,
//       },
//       {
//         employee: {
//           id: 2,
//           ableWorkPosition: [EWorkPosition.매점],
//           ableWorkTime: {
//             [EDayOfWeek.월]: [EWorkTime.오픈],
//           },
//         },
//         ableMinWorkCount: 0,
//         ableMaxWorkCount: 2,
//       },
//     ] as EmployeeCondition[];

//     const mockUserInput = {
//       startDateDay: DateDay.fromDayOfWeek(startDate, EDayOfWeek.월),
//       workConditionOfWeek: {
//         월: [_.cloneDeep(workConditionEntry)],
//       },
//       employeeConditions: _.cloneDeep(ableEmp),
//       maxWorkComboDayCount: 4,
//     } as UserInputCondition;

//     const generator = new ScheduleGenerator(mockUserInput, 1000000);

//     await generator.generate(1000 * 60 * 5);

//     const result = generator.getResult();
//     expect(result.length).toBe(2);
//   });

//   test('filtering 메서드 테스트', () => {
//     const ableEmp = [
//       {
//         employee: {
//           id: 1,
//           ableWorkPosition: [EWorkPosition.매점],
//           ableWorkTime: {
//             [EDayOfWeek.월]: [EWorkTime.오픈],
//           },
//         },
//         ableMinWorkCount: 0,
//         ableMaxWorkCount: 2,
//       },
//       {
//         employee: {
//           id: 2,
//           ableWorkPosition: [EWorkPosition.매점],
//           ableWorkTime: {
//             [EDayOfWeek.월]: [EWorkTime.오픈],
//           },
//         },
//         ableMinWorkCount: 0,
//         ableMaxWorkCount: 2,
//       },
//     ] as EmployeeCondition[];
//     const generator = new ScheduleGenerator(
//       {
//         workConditionOfWeek: {
//           월: [_.cloneDeep(workConditionEntry)],
//         },
//         employeeConditions: _.cloneDeep(ableEmp),
//         maxWorkComboDayCount: 4,
//       } as UserInputCondition,
//       10,
//     );
//     generator['filter_가능한_모든_근무자들'](workConditionEntry);
//     expect(generator['possibleEmployees'].length).toEqual(2);
//   });
// });
