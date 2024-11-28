import { DateDay } from '@/entity/interface/DateDay';
import { ISchedule } from '@/entity/interface/ISchedule';
import {
  APIUserInputConditionSchema,
  IEmployeeSchema,
  UserInputCondition,
} from '@/entity/types';
import { employeeService } from '@/feature/employee/employee.service';
import { ScheduleGenerator } from '@/feature/schedule/schedule-generator';
import { appDataSource } from '@/share/libs/typerom/data-source';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  const { success, data } = APIUserInputConditionSchema.safeParse(body);
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

  const ids = employeeConditions.map((emp) => emp.employee.id);
  const employees = await employeeService(await appDataSource()).findByIds(ids);
  employees.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

  const userInputCondition: UserInputCondition = {
    startDateDay: DateDay.fromIDateDayEntity(startIDateDayEntity),
    maxWorkComboDayCount,
    employeeConditions: employeeConditions.map((emp, idx) => ({
      ...emp,
      employee: IEmployeeSchema.parse(employees[idx]),
    })),
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
