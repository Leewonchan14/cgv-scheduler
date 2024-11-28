// components/ScheduleDisplay.tsx

'use client';

import { DateDay } from '@/entity/interface/DateDay';
import { ISchedule } from '@/entity/interface/ISchedule';
import { WorkConditionOfWeek } from '@/entity/types';
import { isLightColor } from '@/share/libs/util/isLightColor';
import _ from 'lodash';
import React, { useState } from 'react';

interface ScheduleDisplayProps {
  startDate: Date;
  schedules: ISchedule[];
  isIdle: boolean;
  isPending: boolean;
  handleSetWorkCondition: (_: WorkConditionOfWeek) => void;
}

const makeColor = () =>
  `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')}50`;
const colors = _.range(30).map(() => makeColor());

const getColor = (id: number | undefined) => colors[id ?? 0];

const ScheduleDisplay: React.FC<ScheduleDisplayProps> = ({
  startDate,
  isIdle,
  isPending,
  schedules,
  handleSetWorkCondition,
}: ScheduleDisplayProps) => {
  const [hoverId, setHoverId] = useState(-1);

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
                  className="p-4 px-2 border rounded-lg shadow bg-gray-50"
                >
                  <h3 className="mb-2 text-xl font-semibold text-center">
                    {day}
                  </h3>
                  <ul>
                    {schedule[day]?.map((entry, idx) => {
                      const isLight = isLightColor(
                        getColor(entry.employee?.id),
                      );
                      const isHover = hoverId === entry.employee?.id;
                      const bgColorHover = colors[
                        entry.employee?.id ?? 0
                      ].slice(0, -2);
                      const bgColor = colors[entry.employee?.id ?? 0];
                      return (
                        <li
                          onMouseEnter={() =>
                            setHoverId(entry.employee?.id ?? -1)
                          }
                          onMouseLeave={() => setHoverId(-1)}
                          key={idx}
                          className="mb-2"
                        >
                          <div
                            style={{
                              backgroundColor: isHover ? bgColorHover : bgColor,
                            }}
                            className={`flex flex-col items-start px-2 py-1 rounded-lg transition-transform duration-200
                            ${isHover && 'drop-shadow-2xl transform scale-105 font-bold'}
                            ${isHover && (isLight ? 'text-black' : 'text-white')}`}
                          >
                            <span className="text-lg">
                              {entry.workPosition}
                            </span>
                            <span className="text-sm text-opacity-80">
                              {entry.workTime}
                            </span>
                            <span className={`text-sm text-opacity-80`}>
                              {entry.employee?.name}
                            </span>
                          </div>
                        </li>
                      );
                    })}
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
