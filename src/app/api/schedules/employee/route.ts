import { APIPossibleEmployeeSchema } from '@/entity/types';
import { employeeService } from '@/feature/employee/employee.service';
import { scheduleEntryService } from '@/feature/schedule/schedule-entry.service';
import { ScheduleGenerator } from '@/feature/schedule/schedule-generator';
import { appDataSource } from '@/share/libs/typerom/data-source';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { success, data } = APIPossibleEmployeeSchema.safeParse(body);

  if (!success || !data) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  const { employeeConditions: eConWithIds, workConditionEntry } = data;

  const employeeConditions = await employeeService(
    await appDataSource(),
  ).findByConditionWithId(eConWithIds);

  const { head, tail } = await scheduleEntryService(
    await appDataSource(),
  ).findHeadTail(data.startDate, data.maxWorkComboDayCount);

  const scheduleGenerator = new ScheduleGenerator(
    { ...data, employeeConditions },
    1,
    head,
    tail,
  );
  const filtered = await scheduleGenerator.filteredEmployee({
    ...workConditionEntry,
    employee: undefined,
  });

  filtered['가능한 근무자'] = scheduleGenerator.sort_근무자들(
    filtered['가능한 근무자'],
  );

  return NextResponse.json({ data: filtered });
}
