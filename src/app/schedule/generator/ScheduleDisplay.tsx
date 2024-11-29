// components/ScheduleDisplay.tsx

'use client';

import WeeklyScheduleDisplay from '@/app/schedule/ui/WeeklySchedule';
import { ISchedule, WorkConditionOfWeek } from '@/entity/types';
import React from 'react';

interface ScheduleDisplayProps {
  startDate: Date;
  schedules: ISchedule[];
  isLoading: boolean;
  handleSetWorkCondition: (_: WorkConditionOfWeek) => void;
}

const ScheduleGenDisplay: React.FC<ScheduleDisplayProps> = ({
  startDate,
  isLoading,
  schedules,
  handleSetWorkCondition,
}: ScheduleDisplayProps) => {
  if (!schedules) {
    return <div className="text-center">근무표를 생성해주세요.</div>;
  }

  if (isLoading) {
    return <div className="text-center">생성 중...</div>;
  }

  return (
    <div>
      {schedules.map((schedule, index) => (
        <div key={index} className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">근무표 #{index + 1}</h2>
          <WeeklyScheduleDisplay startDate={startDate} schedule={schedule} />

          <button
            onClick={() => handleSetWorkCondition(schedule)}
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
