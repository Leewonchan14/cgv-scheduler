// components/ScheduleDisplay.tsx

'use client';

import { scheduleMutateApi } from '@/app/schedule/api/mutate';
import { GeneratorContext } from '@/app/schedule/generator/GeneratorContext';
import WeeklyScheduleDisplay from '@/app/schedule/ui/WeeklySchedule';
import { ISchedule } from '@/entity/types';
import { useIsMutating } from '@tanstack/react-query';
import React, { useContext } from 'react';

interface ScheduleDisplayProps {
  schedules: ISchedule[];
}

const ScheduleGenDisplay: React.FC<ScheduleDisplayProps> = ({
  schedules,
}: ScheduleDisplayProps) => {
  const context = useContext(GeneratorContext);
  if (!context) throw new Error('GeneratorContext가 존재하지 않습니다.');
  const { selectedWeek, onChangeWorkConditionOfWeek } = context;
  const isLoading = useIsMutating(scheduleMutateApi.generate) !== 0;

  if (!schedules) {
    return <div className="text-center">근무표를 먼저 작성 생성해주세요.</div>;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <div className="inline-block w-8 h-8 ml-2 border-2 border-white rounded-full animate-spin border-t-blue-500" />
      </div>
    );
  }

  return (
    <div>
      {schedules.map((schedule, index) => (
        <div key={index} className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">근무표 #{index + 1}</h2>
          <WeeklyScheduleDisplay startDate={selectedWeek} schedule={schedule} />

          <button
            onClick={() => onChangeWorkConditionOfWeek(schedule)}
            className="py-2 my-4 font-bold text-white bg-blue-500 rounded-lg w-28 text-nowrap"
          >
            근무표 선택
          </button>
        </div>
      ))}
      {!schedules.length && (
        <div className="text-center text-red-500">
          가능한 근무표가 없습니다.
        </div>
      )}
    </div>
  );
};

export default ScheduleGenDisplay;
