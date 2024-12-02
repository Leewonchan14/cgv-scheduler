import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { WorkConditionOfWeekSchema } from '@/entity/types';
import { ScheduleCounter } from '@/feature/schedule/schedule-counter';
import {
  createMockEmployee,
  createMockEmployeeCondition,
} from '@/mock/factories/employeeFactory';
import { createMockWorkConditionEntry } from '@/mock/factories/workConditionEntryFactory';

describe('스케쥴 counter 테스트', () => {
  test('아무것도 없을땐 0이어야함', () => {
    const sCounter = new ScheduleCounter(WorkConditionOfWeekSchema.parse({}));

    const totalWorkCnt = sCounter.getTotalWorkCnt();

    const employeeCnt = sCounter.getEmployeeCnt(createMockEmployee());

    expect(totalWorkCnt).toBe(0);
    expect(employeeCnt).toBe(0);
  });

  test('하나 있을땐 1개만', () => {
    const mockEmployeeCondition = createMockEmployeeCondition();
    const workConditionOfWeek = WorkConditionOfWeekSchema.parse({
      [EDayOfWeek.금]: [
        createMockWorkConditionEntry({
          employee: mockEmployeeCondition.employee,
        }),
      ],
    });

    const sCounter = new ScheduleCounter(workConditionOfWeek);

    const totalWorkCnt = sCounter.getTotalWorkCnt();

    const employeeCnt = sCounter.getEmployeeCnt(mockEmployeeCondition.employee);

    expect(totalWorkCnt).toBe(1);
    expect(employeeCnt).toBe(1);
  });

  test('count 하면 1개 증가', () => {
    const mockEmployeeCondition = createMockEmployeeCondition();
    const workConditionOfWeek = WorkConditionOfWeekSchema.parse({
      [EDayOfWeek.금]: [
        createMockWorkConditionEntry({
          employee: mockEmployeeCondition.employee,
        }),
      ],
    });

    const sCounter = new ScheduleCounter(workConditionOfWeek);

    sCounter.countEmployee(mockEmployeeCondition.employee);

    const employeeCnt = sCounter.getEmployeeCnt(mockEmployeeCondition.employee);

    expect(employeeCnt).toBe(2);
  });

  test('discount 하면 1개 증가', () => {
    const mockEmployeeCondition = createMockEmployeeCondition();
    const workConditionOfWeek = WorkConditionOfWeekSchema.parse({
      [EDayOfWeek.금]: [
        createMockWorkConditionEntry({
          employee: mockEmployeeCondition.employee,
        }),
      ],
    });

    const sCounter = new ScheduleCounter(workConditionOfWeek);

    sCounter.discountEmployee(mockEmployeeCondition.employee);

    const employeeCnt = sCounter.getEmployeeCnt(mockEmployeeCondition.employee);

    expect(employeeCnt).toBe(0);
  });
});
