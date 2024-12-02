import { SELECTED_WEEK } from '@/app/schedule/const';
import { APIScheduleSchema, ScheduleSchema } from '@/entity/types';
import { employeeService } from '@/feature/employee/employee.service';
import { scheduleEntryService } from '@/feature/schedule/schedule-entry.service';
import { appDataSource } from '@/share/libs/typerom/data-source';
import _ from 'lodash';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const selectedWeek = request.nextUrl.searchParams.get(SELECTED_WEEK);
  const { success, data } = z.coerce.date().safeParse(selectedWeek ?? '');

  if (!success || !data) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  let result = {};

  try {
    result = await scheduleEntryService(await appDataSource()).findWeekSchedule(
      data,
    );
  } catch (e) {
    return NextResponse.json(
      { message: 'Internal server error', error: e },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: ScheduleSchema.parse(result) });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { success, data } = APIScheduleSchema.safeParse(body);

  if (!success || !data) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  const entries = _.chain(data).values().sort().flatten().value();
  const empService = employeeService(await appDataSource());

  await scheduleEntryService(await appDataSource()).saveWeek(
    entries,
    empService,
  );

  return NextResponse.json({ data: null, message: 'Success' });
}
