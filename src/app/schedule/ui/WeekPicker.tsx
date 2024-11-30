'use client';

import { scheduleQueryApi } from '@/app/schedule/api/queryoption';
import { EDAY_OF_WEEKS_CORRECT, EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { DateDay } from '@/entity/interface/DateDay';
import { getColor } from '@/share/libs/util/isLightColor';
import { useQuery } from '@tanstack/react-query';
import {
  addDays,
  addMonths,
  Day,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  lastDayOfMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ko } from 'date-fns/locale/ko';
import React, { useState } from 'react';

interface WeekPickerProps {
  selectedWeek: Date;
  onWeekSelect: (startDate: Date) => void;
}

const WeekPicker: React.FC<WeekPickerProps> = ({
  selectedWeek,
  onWeekSelect,
}) => {
  const [weekStartDayOfWeek, setWeekStartDayOfWeek] = useState<EDayOfWeek>(
    new DateDay(selectedWeek, 0).dayOfWeek,
  );

  const weekStartsOn = EDAY_OF_WEEKS_CORRECT.indexOf(weekStartDayOfWeek) as Day; // 0: 일요일, 1: 월요일, ..., 6: 토요일;

  const handleWeekStartChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as EDayOfWeek;
    setWeekStartDayOfWeek(value);
    onWeekSelect(
      new DateDay(selectedWeek, 0).getPrevDateDayByDayOfWeek(value).date,
    );
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
      <Days selectedWeek={selectedWeek} weekStartsOn={weekStartsOn} />

      <Cells
        selectedWeek={selectedWeek}
        weekStartsOn={weekStartsOn}
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
    const nextMonth = addMonths(selectedWeek, 1);
    const last = new DateDay(
      lastDayOfMonth(nextMonth),
      0,
    ).getPrevDateDayByDayOfWeek(weekStartDayOfWeek).date;

    onWeekSelect(last);
  };

  const prevMonth = () => {
    const prevMonth = subMonths(selectedWeek, 1);
    const first = new DateDay(
      startOfMonth(prevMonth),
      0,
    ).getNextDateDayByDayOfWeek(weekStartDayOfWeek).date;
    onWeekSelect(first);
  };

  const dateFormat = 'yyyy년 MMMM';

  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={prevMonth}
        className="p-2 text-lg rounded hover:bg-gray-200"
      >
        {'<'}
      </button>
      <div className="text-xl font-semibold">
        {format(selectedWeek, dateFormat, { locale: ko })}
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

const Days: React.FC<{ selectedWeek: Date; weekStartsOn: Day }> = ({
  selectedWeek,
  weekStartsOn,
}) => {
  const days = [];
  const dateFormat = 'eee'; // 요일 약어 (예: 월, 화, 수...)
  const startDateDay = new DateDay(selectedWeek, 0);

  const startDate = startOfWeek(selectedWeek, { weekStartsOn });
  for (let i = 0; i < 7; i++) {
    days.push(
      <div key={i} className="font-medium text-center">
        {format(addDays(startDate, i), dateFormat, { locale: ko })}
      </div>,
    );
  }

  return (
    <div className="grid grid-cols-7 mb-2">
      {startDateDay.get요일_시작부터_끝까지DateDay().map((dateDay) => (
        <div key={dateDay.getDayOfWeek()} className="font-medium text-center">
          {dateDay.getDayOfWeek()}
        </div>
      ))}
    </div>
  );
};

const Cells: React.FC<{
  selectedWeek: Date;
  weekStartsOn: Day;
  onWeekSelect: (_: Date) => void;
}> = ({ selectedWeek, weekStartsOn, onWeekSelect }) => {
  const monthStart = startOfMonth(selectedWeek);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn });
  const endDate = endOfWeek(monthEnd, { weekStartsOn });

  const rows = [];

  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      days.push(
        <Cell
          key={day.toString()}
          selectedWeek={selectedWeek}
          day={day}
          weekStartsOn={weekStartsOn}
          onWeekSelect={onWeekSelect}
        />,
      );
      day = addDays(day, 1);
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
  weekStartsOn: Day;
  onWeekSelect: (_: Date) => void;
}> = ({ day, selectedWeek, weekStartsOn, onWeekSelect }) => {
  const { data, isLoading } = useQuery(scheduleQueryApi.findByDate(day));

  const dateFormat = 'd';
  const formattedDate = format(day, dateFormat);
  const isSameMon = isSameMonth(selectedWeek, startOfMonth(day));
  const isSameWeek = new DateDay(selectedWeek, 0).isSameWeek(day);

  const cellDynamicClassName = `${!isSameMon && 'text-gray-400'} ${isSameWeek && 'bg-blue-200'}`;

  const idx = parseInt(formattedDate) - 1;
  const cnt = data?.[idx];

  return (
    <div
      onClick={() => onWeekSelect(startOfWeek(day, { weekStartsOn }))}
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
