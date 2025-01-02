import { SELECTED_WEEK } from '@/app/schedule/const';
import { DateDay } from '@/entity/interface/DateDay';
import { APIScheduleSchema, ScheduleSchema } from '@/entity/types';
import { employeeService } from '@/feature/employee/employee.service';
import { scheduleEntryService } from '@/feature/schedule/schedule-entry.service';
import { appDataSource } from '@/share/libs/typerom/data-source';
import _ from 'lodash';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const selectedWeek = request.nextUrl.searchParams.get(SELECTED_WEEK);
  if (!z.coerce.date().safeParse(selectedWeek).success || !selectedWeek) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  let result = {};

  try {
    result = await scheduleEntryService(await appDataSource()).findWeekSchedule(
      DateDay.fromString(selectedWeek).lib.toDate(),
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
  const selectedWeekParam = request.nextUrl.searchParams.get(SELECTED_WEEK);
  const body = await request.json();
  const selectedWeekParse = z.coerce.date().safeParse(selectedWeekParam ?? '');
  const scheduleOfWeekParse = APIScheduleSchema.safeParse(body);

  if (!selectedWeekParse.success || !scheduleOfWeekParse.success) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }
  const empService = employeeService(await appDataSource());
  const updateEntries = _.chain(scheduleOfWeekParse.data)
    .values()
    .sort()
    .flatten()
    .value();

  await scheduleEntryService(await appDataSource()).saveWeek(
    selectedWeekParse.data,
    updateEntries,
    empService,
  );

  return NextResponse.json({ data: null, message: 'Success' });
}

export async function DELETE(request: NextRequest) {
  const selectedWeekParam = request.nextUrl.searchParams.get(SELECTED_WEEK);
  const selectedWeekParse = z.coerce.date().safeParse(selectedWeekParam ?? '');

  if (!selectedWeekParse.success) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  await scheduleEntryService(await appDataSource()).removeByWeek(
    selectedWeekParse.data,
  );

  return NextResponse.json({ data: null, message: 'Success' });
}
