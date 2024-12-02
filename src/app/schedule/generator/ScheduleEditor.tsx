'use client';

import { scheduleMutateApi } from '@/app/schedule/api/mutate';
import { scheduleQueryApi } from '@/app/schedule/api/queryoption';
import DayEditor from '@/app/schedule/generator/ScheduleDayEditor';
import LoadingAnimation from '@/app/ui/loading/loading-animation';
import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
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
import React, { useEffect, useMemo, useState } from 'react';

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
          timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
        },
        {
          id: uuid(),
          date: DateDay.fromDayOfWeek(startDate, dayOfWeek).date,
          workPosition: EWorkPosition.매점,
          workTime: EWorkTime.마감,
          timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.마감),
        },
        {
          id: uuid(),
          date: DateDay.fromDayOfWeek(startDate, dayOfWeek).date,
          workPosition: EWorkPosition.플로어,
          workTime: EWorkTime.오픈,
          timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
        },
        {
          id: uuid(),
          date: DateDay.fromDayOfWeek(startDate, dayOfWeek).date,
          workPosition: EWorkPosition.플로어,
          workTime: EWorkTime.마감,
          timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.마감),
        },
      ] as WorkConditionEntry[],
    ]),
  ) as WorkConditionOfWeek;
};

interface ScheduleEditorProps {
  selectedWeek: Date;
  workConditionOfWeek: WorkConditionOfWeek;
  handleChangeWorkCondition: (_: WorkConditionOfWeek) => void;
}

const ScheduleEditor: React.FC<ScheduleEditorProps> = ({
  selectedWeek,
  workConditionOfWeek,
  handleChangeWorkCondition,
}) => {
  const { data: schedule, isLoading } = useQuery(
    scheduleQueryApi.findWeek(selectedWeek),
  );
  const init = useMemo(
    () => getInitialWorkConditionOfWeek(selectedWeek),
    [selectedWeek],
  );
  const [hoverId, setHoverId] = useState(-1);

  useEffect(() => {
    if (!schedule) return;
    const newLocal = _.sum(_.map(schedule, (ar) => _.size(ar)));
    const isInit = newLocal === 0;
    const newState = isInit ? init : schedule;
    handleChangeWorkCondition(newState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule]);

  const onChangeWorkCondition = (
    dayOfWeek: EDayOfWeek,
    entries: WorkConditionEntry[],
  ) => {
    handleChangeWorkCondition({
      ...workConditionOfWeek,
      [dayOfWeek]: entries,
    });
  };

  if (isLoading) {
    return <LoadingAnimation text={'근무표를 가져오는중'} />;
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-1 md:grid-cols-7">
        {new DateDay(selectedWeek, 0)
          .get요일_시작부터_끝까지DayOfWeek()
          .map((dayOfWeek) => (
            <DayEditor
              key={dayOfWeek}
              hoverId={hoverId}
              setHoverId={(id) => setHoverId(id)}
              dayOfWeek={dayOfWeek}
              entries={workConditionOfWeek[dayOfWeek]}
              onChangeWorkCondition={onChangeWorkCondition}
              selectedWeek={selectedWeek}
            />
          ))}
      </div>
      <div className="text-center">
        <CreateScheduleButton workConditionOfWeek={workConditionOfWeek} />
      </div>
    </div>
  );
};

const CreateScheduleButton: React.FC<{
  workConditionOfWeek: WorkConditionOfWeek;
}> = ({ workConditionOfWeek }) => {
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

    await mutateAsync(data);
    router.replace(`/schedule?${query}`);
  };

  return (
    <button
      onClick={onSubmit}
      disabled={isPending}
      className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 disabled:opacity-50"
    >
      현재 근무표 저장하기
      {isPending && (
        <div className="inline-block w-4 h-4 ml-2 border-2 border-white rounded-full animate-spin border-t-blue-500" />
      )}
    </button>
  );
};

export default ScheduleEditor;
