import { SELECTED_WEEK } from '@/app/schedule/const';
import {
  APIUserInputConditionSchema,
  IEmployeeSchema,
  ScheduleSchema,
  UserInputCondition,
  WorkConditionOfWeek,
} from '@/entity/types';
import { employeeService } from '@/feature/employee/employee.service';
import { scheduleEntryService } from '@/feature/schedule/schedule-entry.service';
import { ScheduleGenerator } from '@/feature/schedule/schedule-generator';
import { appDataSource } from '@/share/libs/typerom/data-source';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const selectedWeek = request.nextUrl.searchParams.get(SELECTED_WEEK);
  const { success, data } = z.coerce.date().safeParse(selectedWeek ?? '');

  if (!success || !data) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  const result = await (
    await scheduleEntryService(await appDataSource())
  ).findWeekSchedule(data);

  return NextResponse.json({ data: ScheduleSchema.parse(result) });
}

export async function POST(request: Request) {
  const body = await request.json();

  const { success, data, error } = APIUserInputConditionSchema.safeParse(body);
  if (!success) {
    return NextResponse.json({ message: error }, { status: 400 });
  }

  const {
    employeeConditions,
    maxSchedule,
    maxWorkComboDayCount,
    startDate,
    workConditionOfWeek,
  } = data;

  const ids = employeeConditions.map((emp) => emp.employee.id);
  const employees = await employeeService(await appDataSource()).findByIds(ids);
  employees.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

  const userInputCondition: UserInputCondition = {
    startDate,
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
    data: generator.getResult() as WorkConditionOfWeek[],
  };

  return NextResponse.json(response);
}
