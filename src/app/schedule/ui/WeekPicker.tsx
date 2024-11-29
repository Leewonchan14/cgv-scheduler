// components/WeekPicker.tsx

'use client';

import { EDAY_OF_WEEKS_CORRECT, EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { DateDay } from '@/entity/interface/DateDay';
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

  const startDateDay = new DateDay(
    startOfWeek(selectedWeek, { weekStartsOn }),
    0,
  );

  const renderHeader = () => {
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

  const renderDays = () => {
    const days = [];
    const dateFormat = 'eee'; // 요일 약어 (예: 월, 화, 수...)

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

  const renderCells = () => {
    const monthStart = startOfMonth(selectedWeek);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn });
    const endDate = endOfWeek(monthEnd, { weekStartsOn });

    const dateFormat = 'd';
    const rows = [];

    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;

        const isSameMon = isSameMonth(day, monthStart);
        const isSameWeek = new DateDay(selectedWeek, 0).isSameWeek(cloneDay);

        const cellDynamicClassName = `${!isSameMon && 'text-gray-400'} ${isSameWeek && 'bg-blue-200'}`;

        days.push(
          <div
            key={day.toString()}
            className={`p-2 text-center border rounded cursor-pointer hover:bg-blue-200 ${
              cellDynamicClassName
            }`}
            onClick={() =>
              onWeekSelect(startOfWeek(cloneDay, { weekStartsOn }))
            }
          >
            {formattedDate}
          </div>,
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

  const handleWeekStartChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as EDayOfWeek;
    setWeekStartDayOfWeek(value);

    onWeekSelect(
      new DateDay(selectedWeek, 0).getPrevDateDayByDayOfWeek(value).date,
    );
  };

  return (
    <div className="p-4 bg-white border rounded-lg shadow">
      {renderHeader()}
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
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default WeekPicker;
