'use client';

import { scheduleQueryApi } from '@/app/schedule/api/queryoption';
import { EDAY_OF_WEEKS_CORRECT } from '@/entity/enums/EDayOfWeek';
import { DateDay } from '@/entity/interface/DateDay';
import { day_js } from '@/lib/dayjs';
import { getColor } from '@/share/libs/util/isLightColor';
import { useQuery } from '@tanstack/react-query';
import { Dayjs } from 'dayjs';
import _ from 'lodash';
import React from 'react';

interface WeekPickerProps {
  selectedWeek: Date;
  onWeekSelect: (startDate: Date) => void;
}

const WeekPicker: React.FC<WeekPickerProps> = ({
  selectedWeek,
  onWeekSelect,
}) => {
  const indexOfDayOfWeek = day_js(selectedWeek).get('day');

  const handleWeekStartChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // 다음주 value에 해당하는 날
    let newWeek = day_js(selectedWeek);
    while (newWeek.day() !== parseInt(e.target.value)) {
      newWeek = newWeek.add(1, 'day');
    }
    onWeekSelect(newWeek.toDate());
  };

  return (
    <div className="p-4 bg-white border rounded-lg shadow">
      <Header selectedWeek={selectedWeek} onWeekSelect={onWeekSelect} />
      <div className="flex justify-end mb-2">
        <label className="mr-2">주 시작 요일:</label>
        <select
          value={indexOfDayOfWeek}
          onChange={handleWeekStartChange}
          className="p-2 border rounded"
        >
          {EDAY_OF_WEEKS_CORRECT.map((day, index) => (
            <option key={day} value={index}>
              {day}
            </option>
          ))}
        </select>
      </div>
      <Days selectedWeek={selectedWeek} />

      <Cells selectedWeek={selectedWeek} onWeekSelect={onWeekSelect} />
    </div>
  );
};

const Header: React.FC<{
  selectedWeek: Date;
  onWeekSelect: (_: Date) => void;
}> = ({ selectedWeek, onWeekSelect }) => {
  const indexOfDayOfWeek = day_js(selectedWeek).day();

  const nextMonth = () => {
    let endOfMonth = day_js(selectedWeek).add(1, 'month').endOf('month');
    while (endOfMonth.day() !== indexOfDayOfWeek) {
      endOfMonth = endOfMonth.subtract(1, 'day');
    }

    onWeekSelect(endOfMonth.toDate());
  };

  const prevMonth = () => {
    let startOfMonth = day_js(selectedWeek)
      .subtract(1, 'month')
      .startOf('month');

    while (startOfMonth.day() !== indexOfDayOfWeek) {
      startOfMonth = startOfMonth.add(1, 'day');
    }
    onWeekSelect(startOfMonth.toDate());
  };

  const dateFormat = 'YYYY년 MMMM';

  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={prevMonth}
        className="p-2 text-lg rounded hover:bg-gray-200"
      >
        {'<'}
      </button>
      <div className="text-xl font-semibold">
        {day_js(selectedWeek).format(dateFormat)}
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
  return (
    <div className="grid grid-cols-7 mb-2">
      {_.range(7).map((i) => (
        <div key={i} className="font-medium text-center">
          {day_js(selectedWeek).add(i, 'day').format('ddd')}
        </div>
      ))}
    </div>
  );
};

const Cells: React.FC<{
  selectedWeek: Date;
  onWeekSelect: (_: Date) => void;
}> = ({ selectedWeek, onWeekSelect }) => {
  const weekStartsOn = day_js(selectedWeek).day();
  let startDate = day_js(selectedWeek).startOf('month');
  while (startDate.day() !== weekStartsOn) {
    startDate = startDate.subtract(1, 'day');
  }
  let endDate = day_js(selectedWeek).endOf('month');
  while (endDate.day() !== weekStartsOn) {
    endDate = endDate.subtract(1, 'day');
  }

  const Row = (startOfWeek: Dayjs) =>
    _.range(7).map((i) => {
      const day = startOfWeek.add(i, 'day').toDate();
      return (
        <Cell
          key={day.toString()}
          selectedWeek={selectedWeek}
          startOfWeek={startOfWeek.toDate()}
          day={day}
          onWeekSelect={onWeekSelect}
        />
      );
    });

  return (
    <div className="grid grid-cols-7">
      {_.range(endDate.diff(startDate, 'day') / 7 + 1).map((week) => {
        const startOfWeek = startDate.add(week, 'week');
        return Row(startOfWeek);
      })}
    </div>
  );
};

const Cell: React.FC<{
  day: Date;
  startOfWeek: Date;
  selectedWeek: Date;
  onWeekSelect: (_: Date) => void;
}> = ({ day, selectedWeek, startOfWeek, onWeekSelect }) => {
  const { data, isLoading } = useQuery(scheduleQueryApi.findByDate(day));

  const dateFormat = 'D';
  const formattedDate = day_js(day).format(dateFormat);
  const isSameMon = day_js(selectedWeek).isSame(day_js(day), 'month');
  const isSameWeek = new DateDay(selectedWeek, 0).isSameWeek(day);

  const cellDynamicClassName = `${!isSameMon && 'text-gray-400'} ${isSameWeek && 'bg-blue-200'}`;

  const idx = parseInt(formattedDate) - 1;
  const cnt = data?.[idx];

  return (
    <div
      onClick={() => onWeekSelect(startOfWeek)}
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
