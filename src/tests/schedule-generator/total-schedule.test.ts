import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { DateDay } from '@/entity/interface/DateDay';
import { ScheduleGenerator } from '@/feature/schedule/schedule-generator';
import { WorkTimeSlot } from '@/feature/schedule/work-time-slot-handler';
import {
  createMockEmployee,
  createMockEmployeeCondition,
} from '@/mock/factories/employeeFactory';
import { createMockWorkConditionEntry } from '@/mock/factories/workConditionEntryFactory';
import _ from 'lodash';

describe('스케쥴 생성기 테스트', () => {
  test('통합 테스트', async () => {
    jest.useRealTimers();

    const employees = _.range(9).map(() => createMockEmployee());

    const wCon1 = createMockWorkConditionEntry();

    const dateDay = new DateDay(wCon1.date, 0);

    const date = dateDay.startDate;

    const openMajum_2 = _.range(0, 2).map((i) =>
      createMockWorkConditionEntry({
        date,
        employee: employees[i],
        workPosition: EWorkPosition.매점,
        workTime: EWorkTime.오픈,
        timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
      }),
    );

    const closeMajum_2 = _.range(2, 4).map((i) =>
      createMockWorkConditionEntry({
        date,
        employee: employees[i],
        workPosition: EWorkPosition.매점,
        workTime: EWorkTime.마감,
        timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.마감),
      }),
    );

    const openFloor_2 = _.range(4, 6).map((i) =>
      createMockWorkConditionEntry({
        date,
        employee: employees[i],
        workPosition: EWorkPosition.플로어,
        timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
      }),
    );

    const closeFloor_2 = _.range(6, 8).map((i) =>
      createMockWorkConditionEntry({
        date,
        employee: employees[i],
        workPosition: EWorkPosition.플로어,
        workTime: EWorkTime.마감,
        timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.마감),
      }),
    );

    const multi_2 = _.range(8, 10).map((_i) =>
      createMockWorkConditionEntry({
        date,
        workPosition: EWorkPosition.멀티,
        workTime: EWorkTime.선택,
        timeSlot: new WorkTimeSlot('10:00', '16:00'),
      }),
    );

    multi_2[0].employee = employees[8];
    multi_2[1].employee = undefined;
    multi_2[1].timeSlot = new WorkTimeSlot('16:00', '22:30');

    const workConditions = [
      ...openMajum_2,
      ...closeMajum_2,
      ...openFloor_2,
      ...closeFloor_2,
      ...multi_2,
    ];

    const ableEmp = _.range(3).map(() => createMockEmployee());

    const scheduleGenerator = new ScheduleGenerator(
      {
        startDate: date,
        maxWorkComboDayCount: 3,
        employeeConditions: [...employees, ...ableEmp].map((employee) =>
          createMockEmployeeCondition({ employee }),
        ),
        workConditionOfWeek: {
          [dateDay.dayOfWeek]: workConditions,
        },
      },
      5,
    );

    scheduleGenerator['isValidate'] = jest.fn(() => true);

    await scheduleGenerator.generate(1000 * 60 * 5);

    const result = scheduleGenerator.getResult();

    expect(result.length).toBe(ableEmp.length);
  });
});
