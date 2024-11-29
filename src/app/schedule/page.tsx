'use client';

import { scheduleQueryApi } from '@/app/schedule/api/queryoption';
import { SELECTED_WEEK } from '@/app/schedule/const';
import WeekPicker from '@/app/schedule/ui/WeekPicker';
import WeeklyScheduleDisplay from '@/app/schedule/ui/WeeklySchedule';
import { useQueryParam } from '@/app/share/util/useQueryParam';
import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { DateDay } from '@/entity/interface/DateDay';
import { useQuery } from '@tanstack/react-query';
import { format, formatDate } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { z } from 'zod';

const initDayOfWeek = EDayOfWeek.목;

const SchedulePage: React.FC = () => {
  const defaultDate = new DateDay(new Date(), 0).getPrevDateDayByDayOfWeek(
    initDayOfWeek,
  ).date;

  const [selectedWeek, setSelectedWeek] = useQueryParam(
    z.coerce.date().optional().default(defaultDate),
    SELECTED_WEEK,
  );

  const { data: schedule, isLoading } = useQuery(
    scheduleQueryApi.findWeek(selectedWeek),
  );

  const handleSelectWeek = (startDate: Date): void => {
    setSelectedWeek(formatDate(startDate, 'yyyy-MM-dd'));
  };

  return (
    <div className="container mx-auto">
      <h1 className="mb-6 text-3xl font-bold">근무 일정</h1>
      <WeekPicker selectedWeek={selectedWeek} onWeekSelect={handleSelectWeek} />
      <div className="h-10" />
      <WeeklyScheduleDisplay startDate={selectedWeek} schedule={schedule} />
      <PostScheduleButton disable={isLoading} selectedWeek={selectedWeek} />
    </div>
  );
};

const PostScheduleButton: React.FC<{
  disable: boolean;
  selectedWeek: Date;
}> = ({ disable }) => {
  const searchParam = useSearchParams();
  const date = z.coerce
    .date()
    .parse(searchParam.get(SELECTED_WEEK) ?? new Date());
  const query = new URLSearchParams({
    [SELECTED_WEEK]: format(date, 'yyyy-MM-dd'),
  }).toString();
  const router = useRouter();

  if (disable) return null;

  return (
    <button
      onClick={() => router.push(`/schedule/generator?${query.toString()}`)}
      disabled={disable}
      className="block py-2 my-4 mx-auto font-bold text-white bg-blue-500 rounded-lg w-40 text-nowrap disabled:opacity-50"
    >
      근무표 생성 및 수정
    </button>
  );
};

export default SchedulePage;
