'use client';

import { scheduleQueryApi } from '@/app/schedule/api/queryoption';
import { SELECTED_WEEK } from '@/app/schedule/const';
import WeeklyScheduleDisplay from '@/app/schedule/ui/WeeklySchedule';
import WeekPicker from '@/app/schedule/ui/WeekPicker';
import { useQueryParam } from '@/app/share/util/useQueryParam';
import { day_js } from '@/lib/dayjs';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { NextPage } from 'next';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';
import { z } from 'zod';

const FORMAT_STRING = 'YYYY-MM-DD';

const ScheduleExplorer: NextPage<{}> = ({}) => {
  const [selectedWeek, setSelectedWeek] = useQueryParam(
    z.coerce.date().optional(),
    SELECTED_WEEK,
  );

  useEffect(() => {
    const selectedDate = day_js(
      window.localStorage.getItem(SELECTED_WEEK) ?? undefined,
    );
    setSelectedWeek(selectedDate.format(FORMAT_STRING));
  }, [setSelectedWeek]);

  useEffect(() => {
    if (!selectedWeek) return;

    window.localStorage.setItem(
      SELECTED_WEEK,
      day_js(selectedWeek).format(FORMAT_STRING),
    );
  }, [selectedWeek]);

  const { data: schedule, isLoading } = useQuery(
    scheduleQueryApi.findWeek(selectedWeek),
  );

  const handleSelectWeek = (startDate: Date): void => {
    const str = day_js(startDate).format(FORMAT_STRING);
    setSelectedWeek(str);
    window.localStorage.setItem(SELECTED_WEEK, str);
  };

  if (!selectedWeek) return null;

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
