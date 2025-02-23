'use client';

import LoadingAnimation from '@/app/ui/loading/loading-animation';
import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { EWORK_POSITION } from '@/entity/enums/EWorkPosition';
import { DateDay } from '@/entity/interface/DateDay';
import { WorkConditionEntry, WorkConditionOfWeek } from '@/entity/types';
import { WorkTimeSlot } from '@/feature/schedule/work-time-slot-handler';
import { getColor, isLightColor } from '@/share/libs/util/isLightColor';
import _ from 'lodash';
import React, { useState } from 'react';

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
    <React.Fragment>
      <div className="grid grid-cols-2 gap-1 md:grid-cols-7 text-nowrap">
        {new DateDay(startDate, 0)
          .get요일_시작부터_끝까지DayOfWeek()
          .map((day) => (
            <DayOfWeekDisplay
              key={day}
              day={day}
              schedule={schedule}
              hoverId={hoverId}
              setHoverId={setHoverId}
            />
          ))}
      </div>
      <div className="my-4 border-t-8 border-black border-opacity-80" />
      {/* 이름, 근무자들의 일주일간 근무일수, 총 근무시간을 계산 */}
      <MetaDataDisplay
        schedule={schedule}
        hoverId={hoverId}
        setHoverId={setHoverId}
      />
    </React.Fragment>
  );
};

interface DayOfWeekDisplayProps {
  day: EDayOfWeek;
  schedule: WorkConditionOfWeek;
  hoverId: number;
  setHoverId: (id: number) => void;
}

const DayOfWeekDisplay: React.FC<DayOfWeekDisplayProps> = ({
  day,
  schedule,
  hoverId,
  setHoverId,
}) => {
  const howManyWorkPeopleInDay = _.chain(
    schedule[day]?.map((e) => e.employee?.id),
  )
    .compact()
    .size()
    .value();

  return (
    <div className="p-4 px-2 border rounded-lg shadow bg-gray-50">
      <h3 className="mb-2 text-xl font-semibold text-center">{day}</h3>
      <ul>
        {EWORK_POSITION.map((pos) =>
          schedule[day]
            ?.filter((e) => e.workPosition === pos)
            .map((entry) => (
              <EntryScheduleDisplay
                key={entry.id}
                hoverId={hoverId}
                setHoverId={(id) => setHoverId(id)}
                entry={entry}
              />
            )),
        )}
      </ul>
      <div className="w-full text-center bg-gray-300 rounded-lg">
        근무인원 : {howManyWorkPeopleInDay}
      </div>
    </div>
  );
};

interface EntryScheduleDisplayProps {
  hoverId: number;
  setHoverId: (id: number) => void;
  entry: WorkConditionEntry;
}

const EntryScheduleDisplay: React.FC<EntryScheduleDisplayProps> = ({
  entry,
  hoverId,
  setHoverId,
}) => {
  const isSelectEmployee = !!entry.employee;
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
        style={{ backgroundColor: isHover ? bgColorHover : bgColor }}
        className={`flex md:flex-col items-center justify-evenly md:items-start px-2 py-1 rounded-lg transition-transform duration-200
                      ${isHover && 'drop-shadow-2xl transform scale-105 font-bold'}
                      ${isHover && (isLight ? 'text-black' : 'text-white')}`}
      >
        <span className="text-lg">{entry.workPosition}</span>
        <span className="text-sm text-opacity-80">{entry.workTime}</span>
        <span
          className={`text-sm text-opacity-80 ${!isSelectEmployee && 'text-red-500 font-bold'}`}
        >
          {entry.employee?.name ?? '선택 되지 않음'}
        </span>
      </div>
    </li>
  );
};

interface MetaDataDisplayProps {
  schedule: WorkConditionOfWeek;
  hoverId: number;
  setHoverId: (id: number) => void;
}
const MetaDataDisplay: React.FC<MetaDataDisplayProps> = ({
  schedule,
  hoverId,
  setHoverId,
}) => {
  const employees = _.chain(schedule)
    .flatMap((v) => v?.flat().map((e) => e.employee))
    .uniqBy('id')
    .filter((e) => !_.isUndefined(e))
    .map((e) => e)
    .sort((a, b) => b.id - a.id)
    .value();

  return (
    <div className="gap-4 font-bold md:grid md:grid-cols-7 text-nowrap">
      {employees.map((employee) => {
        const color = getColor(employee.id);
        const isLight = isLightColor(color);
        const isHover = hoverId === employee.id;

        const bgColorHover = color.slice(0, -2);
        const bgColor = color;
        return (
          <div
            onMouseEnter={() => setHoverId(employee?.id)}
            onMouseLeave={() => setHoverId(-1)}
            style={{ backgroundColor: isHover ? bgColorHover : bgColor }}
            key={employee?.id}
            className={`p-4 rounded-lg transition-transform duration-200 hidden fixed top-0 left-0 right-0 md:relative md:block
                          ${isHover && '!block drop-shadow-2xl transform scale-105 font-bold'}
                          ${isHover && (isLight ? 'text-black' : 'text-white')}`}
          >
            {/* 8공간중 2공간 차지 */}
            <h3 className="text-xl font-semibold text-center">
              {employee?.name}
            </h3>
            <div className="text-center">
              근무일수 :{' '}
              {
                _.chain(schedule)
                  .flatMap((v) => v)
                  .filter((e) => e?.employee?.id === employee?.id)
                  .value().length
              }
            </div>
            <div className="text-center">
              총 근무시간 :{' '}
              {_.chain(schedule)
                .flatMap((v) => v)
                .filter((e) => e?.employee?.id === employee?.id)
                // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                .map((e) => WorkTimeSlot.fromTimeSlot(e?.timeSlot!).duration())
                .sum()
                .value() / 60}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyScheduleDisplay;
