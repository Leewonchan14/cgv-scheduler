import { DateDay } from '@/entity/interface/DateDay';
import { ISchedule } from '@/entity/interface/ISchedule';
import { UserInputCondition, UserInputConditionSchema } from '@/entity/types';
import { ScheduleGenerator } from '@/feature/schedule/schedule-generator';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  const { success, data } = UserInputConditionSchema.safeParse(body);
  if (!success) {
    return NextResponse.json(
      { data: null, message: 'Invalid request' },
      { status: 400 },
    );
  }

  const {
    employeeConditions,
    maxSchedule,
    maxWorkComboDayCount,
    startIDateDayEntity,
    workConditionOfWeek,
  } = data;

  // const employees = await employeeService(await appDataSource()).findByIds(
  //   employeeConditions.map((emp) => emp.employee.id),
  // );

  const userInputCondition: UserInputCondition = {
    startDateDay: DateDay.fromIDateDayEntity(startIDateDayEntity),
    maxWorkComboDayCount,
    employeeConditions,
    workConditionOfWeek,
  };

  const generator = new ScheduleGenerator(userInputCondition, maxSchedule);
  await generator.generate(1000 * 5);

  if (generator.isTimeOut) {
    return NextResponse.json(
      { data: null, message: 'Timeout' },
      { status: 500 },
    );
  }

  const response = {
    data: generator.getResult() as ISchedule[],
  };

  return NextResponse.json(response);
}
