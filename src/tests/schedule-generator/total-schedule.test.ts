import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { DateDay } from '@/entity/interface/DateDay';
import { WorkConditionEntry } from '@/entity/types';
import { ScheduleGenerator } from '@/feature/schedule/schedule-generator';
import { WorkTimeSlot } from '@/feature/schedule/work-time-slot-handler';
import { floorOrMultiOn월Employees, restEmployees } from '@/mock/employees';
import { userInputCondition } from '@/mock/user-input-condition';
import _ from 'lodash';

describe('스케쥴 생성기 테스트', () => {
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
      멀티_1명_마감,
    ) as WorkConditionEntry[];

    const scheduleGenerator = new ScheduleGenerator(
      {
        ...userInputCondition,
        employeeConditions: _.cloneDeep(
          userInputCondition.employeeConditions,
        ).map((e) => ({
          ...e,
          ableMinWorkCount: 0,
          ableMaxWorkCount: 10,
        })),
        workConditionOfWeek: {
          [EDayOfWeek.월]: _.cloneDeep(workCondition),
        },
      },
      10000,
    );

    scheduleGenerator['isValidate'] = jest.fn(() => true);

    await scheduleGenerator.generate(1000 * 60 * 5);

    const result = scheduleGenerator.getResult();

    expect(result.length).toBe(floorOrMultiOn월Employees.length - 1);
  });
});
