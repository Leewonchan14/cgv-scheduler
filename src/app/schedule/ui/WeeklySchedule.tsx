'use client';

import LoadingAnimation from '@/app/ui/loading/loading-animation';
import { DateDay } from '@/entity/interface/DateDay';
import { WorkConditionEntry, WorkConditionOfWeek } from '@/entity/types';
import { getColor, isLightColor } from '@/share/libs/util/isLightColor';
import { useState } from 'react';

interface WeeklyScheduleProps {
  startDate: Date;
  schedule?: WorkConditionOfWeek;
}

const WeeklyScheduleDisplay: React.FC<WeeklyScheduleProps> = ({
  schedule,
  startDate,
}) => {
  const [hoverId, setHoverId] = useState<number>(-1);

  if (!schedule) {
    return <LoadingAnimation text="근무표를 가져오는중..." />;
  }

  return (
    <div className="grid grid-cols-7 gap-1">
      {new DateDay(startDate, 0)
        .get요일_시작부터_끝까지DayOfWeek()
        .map((day) => (
          <div
            key={day}
            className="p-4 px-2 border rounded-lg shadow bg-gray-50"
          >
            <h3 className="mb-2 text-xl font-semibold text-center">{day}</h3>
            <ul>
              {schedule[day]?.map((entry) => (
                <DayScheduleDisplay
                  key={entry.id}
                  hoverId={hoverId}
                  setHoverId={(id) => setHoverId(id)}
                  entry={entry}
                />
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
};

interface DayScheduleProps {
  hoverId: number;
  setHoverId: (id: number) => void;
  entry: WorkConditionEntry;
}

const DayScheduleDisplay: React.FC<DayScheduleProps> = ({
  entry,
  hoverId,
  setHoverId,
}) => {
  const color = getColor(entry.employee?.id);
  const isLight = isLightColor(color);
  const isHover = hoverId === entry.employee?.id;

  const bgColorHover = color.slice(0, -2);
  const bgColor = color;
  return (
    <li
      onMouseEnter={() => setHoverId(entry.employee?.id ?? -1)}
      onMouseLeave={() => setHoverId(-1)}
      key={entry.id}
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
        <span className="text-lg">{entry.workPosition}</span>
        <span className="text-sm text-opacity-80">{entry.workTime}</span>
        <span className={`text-sm text-opacity-80`}>
          {entry.employee?.name}
        </span>
      </div>
    </li>
  );
};

export default WeeklyScheduleDisplay;
