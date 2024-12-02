jest.useFakeTimers();
import { Employee } from '@/entity/employee.entity';
import { UserInputCondition } from '@/entity/types';
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
});
