import { APIPossibleEmployeeSchema } from '@/entity/types';
import { employeeService } from '@/feature/employee/employee.service';
import { ScheduleGenerator } from '@/feature/schedule/schedule-generator';
import { appDataSource } from '@/share/libs/typerom/data-source';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { success, data } = APIPossibleEmployeeSchema.safeParse(body);

  if (!success || !data) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  const {
    employeeConditions: eConWithIds,
    workConditionEntry,
    maxSchedule,
  } = data;

  const employeeConditions = await employeeService(
    await appDataSource(),
  ).findByConditionWithId(eConWithIds);

  const filtered = await new ScheduleGenerator(
    { ...data, employeeConditions },
    maxSchedule,
  ).filteredEmployee({ ...workConditionEntry, employee: undefined });

  return NextResponse.json({ data: filtered });
}
