import { SELECTED_WEEK } from '@/app/schedule/const';
import { scheduleEntryService } from '@/feature/schedule/schedule-entry.service';
import { appDataSource } from '@/share/libs/typerom/data-source';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const selectedWeek = request.nextUrl.searchParams.get(SELECTED_WEEK);
  const { success, data } = z.coerce.date().safeParse(selectedWeek ?? '');

  if (!success || !data) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  return NextResponse.json({
    data: await scheduleEntryService(await appDataSource()).findByDate(data),
  });
}
