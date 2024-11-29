'use client';

import { scheduleQueryApi } from '@/app/schedule/api/queryoption';
import { SELECTED_WEEK } from '@/app/schedule/const';
import WeeklyScheduleDisplay from '@/app/schedule/ui/WeeklySchedule';
import WeekPicker from '@/app/schedule/ui/WeekPicker';
import { useQueryParam } from '@/app/share/util/useQueryParam';
import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { DateDay } from '@/entity/interface/DateDay';
import { useQuery } from '@tanstack/react-query';
import { format, formatDate } from 'date-fns';
import { NextPage } from 'next';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { z } from 'zod';

const initDayOfWeek = EDayOfWeek.목;

interface Props {}

const ScheduleExplorer: NextPage<Props> = ({}) => {
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
    <React.Fragment>
      <WeekPicker selectedWeek={selectedWeek} onWeekSelect={handleSelectWeek} />
      <div className="h-10" />
      <WeeklyScheduleDisplay startDate={selectedWeek} schedule={schedule} />
      <PostScheduleButton disable={isLoading} selectedWeek={selectedWeek} />
    </React.Fragment>
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
      className="block w-40 py-2 mx-auto my-4 font-bold text-white bg-blue-500 rounded-lg text-nowrap disabled:opacity-50"
    >
      근무표 생성 및 수정
    </button>
  );
};

export default ScheduleExplorer;
