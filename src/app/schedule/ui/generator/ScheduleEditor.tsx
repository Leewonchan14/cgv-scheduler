// components/ScheduleEditor.tsx

'use client';

import { employeeQueryApi } from '@/app/employee/api/queryoption';
import { EDAY_OF_WEEKS, EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { DateDay } from '@/entity/interface/DateDay';
import { WorkConditionEntry, WorkConditionOfWeek } from '@/entity/types';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

interface ScheduleEditorProps {
  startDate: Date;
  workConditionOfWeek: WorkConditionOfWeek;
  onChangeWorkCondition: (_: EDayOfWeek, __: WorkConditionEntry[]) => void;
}

const ScheduleEditor: React.FC<ScheduleEditorProps> = ({
  startDate,
  workConditionOfWeek,
  onChangeWorkCondition,
}) => {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold">근무표 배치</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
        {EDAY_OF_WEEKS.map((dayOfWeek) => (
          <DayEditor
            key={dayOfWeek}
            dayOfWeek={dayOfWeek}
            entries={workConditionOfWeek[dayOfWeek] ?? []}
            onChangeWorkCondition={onChangeWorkCondition}
            startDate={startDate}
          />
        ))}
      </div>
    </div>
  );
};

interface DayEditorProps {
  dayOfWeek: EDayOfWeek;
  entries: WorkConditionEntry[];
  onChangeWorkCondition: (_: EDayOfWeek, __: WorkConditionEntry[]) => void;
  startDate: Date;
}

const DayEditor: React.FC<DayEditorProps> = ({
  dayOfWeek,
  entries,
  onChangeWorkCondition,
  startDate,
}) => {
  const { data: employees } = useQuery(employeeQueryApi.findByIds);
  const handleAddEntry = () => {
    const newEntry: WorkConditionEntry = {
      dateDay: DateDay.fromDayOfWeek(startDate, dayOfWeek),
      workPosition: EWorkPosition.매점,
      workTime: EWorkTime.오픈,
    };
    onChangeWorkCondition(dayOfWeek, [...entries, newEntry]);
  };

  const handleRemoveEntry = (index: number) => {
    const updatedEntries = entries.filter((_, idx) => idx !== index);
    onChangeWorkCondition(dayOfWeek, updatedEntries);
  };

  const handleWorkPositionChange = (index: number, position: EWorkPosition) => {
    const updatedEntries = [...entries];
    updatedEntries[index].workPosition = position;
    onChangeWorkCondition(dayOfWeek, updatedEntries);
  };

  const handleWorkTimeChange = (index: number, time: EWorkTime) => {
    const updatedEntries = [...entries];
    updatedEntries[index].workTime = time;
    onChangeWorkCondition(dayOfWeek, updatedEntries);
  };

  const handleEmployeeChange = (index: number, employeeId: number) => {
    const updatedEntries = [...entries];
    const findEmp = employees?.find((emp) => emp.id === employeeId);
    updatedEntries[index].employee = findEmp;
    onChangeWorkCondition(dayOfWeek, updatedEntries);
  };

  if (!employees) return null;

  return (
    <div className="p-4 border rounded-lg shadow bg-gray-50">
      <h3 className="mb-2 text-xl font-semibold text-center">{dayOfWeek}</h3>
      <ul>
        {entries.map((entry, idx) => (
          <li key={idx} className="mb-4">
            <div className="flex flex-col space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  근무 위치
                </label>
                <select
                  value={entry.workPosition}
                  onChange={(e) =>
                    handleWorkPositionChange(
                      idx,
                      e.target.value as EWorkPosition,
                    )
                  }
                  className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
                >
                  {Object.values(EWorkPosition).map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  근무 시간
                </label>
                <select
                  value={entry.workTime}
                  onChange={(e) =>
                    handleWorkTimeChange(idx, e.target.value as EWorkTime)
                  }
                  className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
                >
                  {Object.values(EWorkTime).map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  직원
                </label>
                <select
                  defaultValue={''}
                  onChange={(e) =>
                    handleEmployeeChange(idx, parseInt(e.target.value))
                  }
                  className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
                >
                  <option value="">직원 선택</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => handleRemoveEntry(idx)}
                className="self-end w-20 py-2 mt-2 text-white bg-red-500 rounded-lg hover:text-red-700"
              >
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button
        onClick={handleAddEntry}
        className="px-4 py-2 mt-2 text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600"
      >
        항목 추가
      </button>
    </div>
  );
};

export default ScheduleEditor;
