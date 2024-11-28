// components/ScheduleDisplay.tsx

'use client';

import { DateDay } from '@/entity/interface/DateDay';
import { ISchedule } from '@/entity/interface/ISchedule';
import { WorkConditionOfWeek } from '@/entity/types';
import React from 'react';

interface ScheduleDisplayProps {
  startDate: Date;
  schedules: ISchedule[];
  isIdle: boolean;
  isPending: boolean;
  handleSetWorkCondition: (_: WorkConditionOfWeek) => void;
}

const ScheduleDisplay: React.FC<ScheduleDisplayProps> = ({
  startDate,
  isIdle,
  isPending,
  schedules,
  handleSetWorkCondition,
}: ScheduleDisplayProps) => {
  if (isIdle || !schedules) {
    return <div className="text-center">근무표를 생성해주세요.</div>;
  }

  if (isPending) {
    return <div className="text-center">생성 중...</div>;
  }

  return (
    <div>
      {schedules.map((schedule, index) => (
        <div key={index} className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">근무표 #{index + 1}</h2>
          <div className="grid grid-cols-7 gap-1">
            {new DateDay(startDate, 0)
              .get요일_시작부터_끝까지DayOfWeek()
              .map((day) => (
                <div
                  key={day}
                  className="p-4 border rounded-lg shadow bg-gray-50"
                >
                  <h3 className="mb-2 text-xl font-semibold text-center">
                    {day}
                  </h3>
                  <ul>
                    {schedule[day]?.map((entry, idx) => (
                      <li key={idx} className="mb-2">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {entry.workPosition}
                          </span>
                          <span className="text-sm text-gray-700">
                            {entry.workTime}
                          </span>
                          <span className="text-sm text-gray-700">
                            {entry.employee?.name}
                          </span>
                        </div>
                      </li>
                    )) || <li className="text-sm text-gray-500">근무 없음</li>}
                  </ul>
                </div>
              ))}
          </div>

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

export default ScheduleDisplay;
