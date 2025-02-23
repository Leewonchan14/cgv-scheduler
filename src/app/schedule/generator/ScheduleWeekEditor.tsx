'use client';

import { employeeQueryApi } from '@/app/employee/api/queryoption';
import { scheduleMutateApi } from '@/app/schedule/api/mutate';
import { scheduleQueryApi } from '@/app/schedule/api/queryoption';
import { useGeneratorContext } from '@/app/schedule/generator/GeneratorContext';
import ScheduleDayEditor from '@/app/schedule/generator/ScheduleDayEditor';
import LoadingAnimation from '@/app/ui/loading/loading-animation';
import { ERole } from '@/entity/enums/ERole';
import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { DateDay } from '@/entity/interface/DateDay';
import {
  APIScheduleSchema,
  WorkConditionEntry,
  WorkConditionOfWeek,
} from '@/entity/types';
import { WorkTimeSlot } from '@/feature/schedule/work-time-slot-handler';
import { uuid } from '@/share/libs/util/uuid';
import { useMutation, useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const getInitialWorkConditionOfWeek = (startDate: Date) => {
  const startDateDay = new DateDay(startDate, 0);
  return Object.fromEntries(
    startDateDay.get요일_시작부터_끝까지DayOfWeek().map((dayOfWeek) => [
      dayOfWeek,
      [
        {
          id: uuid(),
          date: DateDay.fromDayOfWeek(startDate, dayOfWeek).date,
          workPosition: EWorkPosition.매점,
          workTime: EWorkTime.오픈,
          timeSlot: WorkTimeSlot.fromWorkTime(
            EWorkPosition.매점,
            EWorkTime.오픈,
          ),
        },
        {
          id: uuid(),
          date: DateDay.fromDayOfWeek(startDate, dayOfWeek).date,
          workPosition: EWorkPosition.매점,
          workTime: EWorkTime.마감,
          timeSlot: WorkTimeSlot.fromWorkTime(
            EWorkPosition.매점,
            EWorkTime.마감,
          ),
        },
        {
          id: uuid(),
          date: DateDay.fromDayOfWeek(startDate, dayOfWeek).date,
          workPosition: EWorkPosition.플로어,
          workTime: EWorkTime.오픈,
          timeSlot: WorkTimeSlot.fromWorkTime(
            EWorkPosition.플로어,
            EWorkTime.오픈,
          ),
        },
        {
          id: uuid(),
          date: DateDay.fromDayOfWeek(startDate, dayOfWeek).date,
          workPosition: EWorkPosition.플로어,
          workTime: EWorkTime.마감,
          timeSlot: WorkTimeSlot.fromWorkTime(
            EWorkPosition.플로어,
            EWorkTime.마감,
          ),
        },
      ] as WorkConditionEntry[],
    ]),
  ) as WorkConditionOfWeek;
};

const ScheduleWeekEditor: React.FC<{}> = () => {
  const { selectedWeek, onChangeWorkConditionOfWeek } = useGeneratorContext();
  const [hoverId, setHoverId] = useState(-1);

  const { data: schedule, isLoading } = useQuery(
    scheduleQueryApi.findWeek(selectedWeek),
  );

  useEffect(() => {
    if (!schedule) return;
    const initSchedule = getInitialWorkConditionOfWeek(selectedWeek);
    const isSumZero = _.sum(_.map(schedule, (ar) => _.size(ar))) === 0;
    onChangeWorkConditionOfWeek(isSumZero ? initSchedule : schedule);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule]);

  if (isLoading) {
    return <LoadingAnimation text={'근무표를 가져오는중'} />;
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-1 md:grid-cols-7">
        {new DateDay(selectedWeek, 0)
          .get요일_시작부터_끝까지DayOfWeek()
          .map((dayOfWeek) => (
            <ScheduleDayEditor
              key={dayOfWeek}
              hoverId={hoverId}
              setHoverId={(id) => setHoverId(id)}
              dayOfWeek={dayOfWeek}
            />
          ))}
      </div>
      <PostScheduleButton />
    </div>
  );
};

const PostScheduleButton: React.FC<{}> = ({}) => {
  const { data: own } = useQuery(employeeQueryApi.getOwn);
  const isAdmin = own?.role === ERole.ADMIN;
  const { workConditionOfWeek, selectedWeek, clearWorkConditionOfWeek } =
    useGeneratorContext();

  const search = useSearchParams();
  const query = new URLSearchParams(
    Object.fromEntries(search.entries()),
  ).toString();
  const router = useRouter();
  const { mutateAsync, isPending } = useMutation(scheduleMutateApi.save);

  const onSubmit = async () => {
    const { success, data } = APIScheduleSchema.safeParse(workConditionOfWeek);

    if (!success || !data) {
      window.alert(
        '근무표를 저장할 수 없습니다. 모든 값이 올바른지 확인하세요.',
      );
      return;
    }

    await mutateAsync({ workConditionOfWeek: data, selectedWeek });
    router.replace(`/schedule?${query}`);
  };

  return (
    <div className="flex justify-center w-full gap-2 font-bold text-white">
      {isAdmin && (
        <button
          onClick={onSubmit}
          disabled={isPending}
          className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          현재 근무표 저장하기
          {isPending && (
            <div className="inline-block w-4 h-4 ml-2 border-2 border-white rounded-full animate-spin border-t-blue-500" />
          )}
        </button>
      )}
      <button
        onClick={clearWorkConditionOfWeek}
        className="px-4 py-2 bg-red-500 rounded hover:bg-red-700 disabled:opacity-50"
      >
        현재 근무표 비우기
      </button>
    </div>
  );
};

export default ScheduleWeekEditor;
