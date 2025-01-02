'use client';

import { scheduleQueryApi } from '@/app/schedule/api/queryoption';
import { EDAY_OF_WEEKS_CORRECT, EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { DateDay } from '@/entity/interface/DateDay';
import { getColor } from '@/share/libs/util/isLightColor';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import React, { useState } from 'react';
dayjs.extend(isSameOrBefore);

interface WeekPickerProps {
  selectedWeek: Date;
  onWeekSelect: (startDate: Date) => void;
}

const WeekPicker: React.FC<WeekPickerProps> = ({
  selectedWeek,
  onWeekSelect,
}) => {
  const [weekStartDayOfWeek, setWeekStartDayOfWeek] = useState<EDayOfWeek>(
    new DateDay(selectedWeek).day(),
  );

  const handleWeekStartChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as EDayOfWeek;
    setWeekStartDayOfWeek(value);
    onWeekSelect(new DateDay(selectedWeek).prevDateByDay(value).lib.toDate());
  };

  return (
    <div className="p-4 bg-white border rounded-lg shadow">
      <Header
        weekStartDayOfWeek={weekStartDayOfWeek}
        selectedWeek={selectedWeek}
        onWeekSelect={onWeekSelect}
      />
      <div className="flex justify-end mb-2">
        <label className="mr-2">주 시작 요일:</label>
        <select
          value={weekStartDayOfWeek}
          onChange={handleWeekStartChange}
          className="p-2 border rounded"
        >
          {EDAY_OF_WEEKS_CORRECT.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      </div>
      <Days selectedWeek={selectedWeek} />

      <Cells
        selectedWeek={selectedWeek}
        weekStartDayOfWeek={weekStartDayOfWeek}
        onWeekSelect={onWeekSelect}
      />
    </div>
  );
};

const Header: React.FC<{
  weekStartDayOfWeek: EDayOfWeek;
  selectedWeek: Date;
  onWeekSelect: (_: Date) => void;
}> = ({ weekStartDayOfWeek, selectedWeek, onWeekSelect }) => {
  const nextMonth = () => {
    const nextMonth = new DateDay(selectedWeek).lib.add(1, 'month');
    const last = new DateDay(nextMonth.endOf('month').toDate())
      .prevDateByDay(weekStartDayOfWeek)
      .lib.toDate();

    onWeekSelect(last);
  };

  const prevMonth = () => {
    const prevMonth = dayjs(selectedWeek).subtract(1, 'month');
    const first = new DateDay(prevMonth.startOf('month').toDate())
      .nextDateByDay(weekStartDayOfWeek)
      .lib.toDate();
    onWeekSelect(first);
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={prevMonth}
        className="p-2 text-lg rounded hover:bg-gray-200"
      >
        {'<'}
      </button>
      <div className="text-xl font-semibold">
        {new DateDay(selectedWeek).format('YYYY년 MM월')}
      </div>
      <button
        onClick={nextMonth}
        className="p-2 text-lg rounded hover:bg-gray-200"
      >
        {'>'}
      </button>
    </div>
  );
};

const Days: React.FC<{ selectedWeek: Date }> = ({ selectedWeek }) => {
  const startDateDay = new DateDay(selectedWeek);

  return (
    <div className="grid grid-cols-7 mb-2">
      {startDateDay.days7().map((dateDay) => (
        <div key={dateDay.day()} className="font-medium text-center">
          {dateDay.day()}
        </div>
      ))}
    </div>
  );
};

const Cells: React.FC<{
  selectedWeek: Date;
  weekStartDayOfWeek: EDayOfWeek;
  onWeekSelect: (_: Date) => void;
}> = ({ selectedWeek, weekStartDayOfWeek, onWeekSelect }) => {
  const dj = dayjs(selectedWeek);
  const monthStart = dj.startOf('month');
  const monthEnd = dj.endOf('month');
  const startDate = new DateDay(monthStart.toDate()).prevDateByDay(
    weekStartDayOfWeek,
  );

  const rows = [];

  let days = [];
  let day = startDate.lib;

  while (day.isSameOrBefore(monthEnd)) {
    for (let i = 0; i < 7; i++) {
      days.push(
        <Cell
          key={day.toString()}
          selectedWeek={selectedWeek}
          day={day.toDate()}
          weekStartDayOfWeek={weekStartDayOfWeek}
          onWeekSelect={onWeekSelect}
        />,
      );
      day = day.add(1, 'day');
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toString()}>
        {days}
      </div>,
    );
    days = [];
  }
  return <div>{rows}</div>;
};

const Cell: React.FC<{
  day: Date;
  selectedWeek: Date;
  weekStartDayOfWeek: EDayOfWeek;
  onWeekSelect: (_: Date) => void;
}> = ({ day, selectedWeek, weekStartDayOfWeek, onWeekSelect }) => {
  const { data, isLoading } = useQuery(scheduleQueryApi.findByDate(day));

  const dayDateDay = new DateDay(day);
  const formattedDate = dayDateDay.format('D');
  const isSameMon = dayDateDay.lib.isSame(
    new DateDay(selectedWeek).lib,
    'month',
  );
  const isSameWeek = new DateDay(selectedWeek)
    .days7()
    .some((dateDay) => dateDay.lib.isSame(dayDateDay.lib));

  const cellDynamicClassName = `${!isSameMon && 'text-gray-400'} ${isSameWeek && 'bg-blue-200'}`;

  const idx = parseInt(formattedDate) - 1;
  const cnt = data?.[idx];

  return (
    <div
      onClick={() =>
        onWeekSelect(dayDateDay.prevDateByDay(weekStartDayOfWeek).lib.toDate())
      }
      className={`flex flex-col justify-between p-2 text-center border rounded cursor-pointer hover:bg-blue-200 ${cellDynamicClassName}`}
    >
      <div>{formattedDate}</div>
      {/* 랜덤 색 위의 숫자 */}
      <div
        style={{ ...(!isLoading && { backgroundColor: getColor(idx) }) }}
        className={`h-4 text-xs rounded-full bg-gray-300
                      ${isLoading && 'animate-pulse'}
                      ${!isLoading && cnt === 0 && 'invisible'}`}
      >
        {cnt}
      </div>
    </div>
  );
};

export default WeekPicker;
