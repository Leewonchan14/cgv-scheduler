// components/ScheduleEditor.tsx

'use client';

import { employeeQueryApi } from '@/app/employee/api/queryoption';
import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { EWORK_POSITION, EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { DateDay } from '@/entity/interface/DateDay';
import { WorkConditionEntry, WorkConditionOfWeek } from '@/entity/types';
import { WorkTimeSlot } from '@/feature/schedule/work-time-slot-handler';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
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

      <div className="grid grid-cols-1 gap-1 md:grid-cols-7">
        {new DateDay(startDate, 0)
          .get요일_시작부터_끝까지DayOfWeek()
          .map((dayOfWeek) => (
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
  const { data: employees } = useQuery(employeeQueryApi.findAll);

  const handleAddEntry = (position: EWorkPosition) => {
    const newEntry: WorkConditionEntry = {
      id: parseInt(_.uniqueId()),
      date: DateDay.fromDayOfWeek(startDate, dayOfWeek).date,
      workPosition: position,
      workTime: EWorkTime.오픈,
      timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
    };
    onChangeWorkCondition(dayOfWeek, [...entries, newEntry]);
  };

  const handleRemoveEntry = (id: number) => {
    const updatedEntries = entries.filter((e) => e.id !== id);
    onChangeWorkCondition(dayOfWeek, updatedEntries);
  };

  const handleWorkTimeChange = (id: number, time: EWorkTime) => {
    onChangeWorkCondition(
      dayOfWeek,
      _.map(entries, (e) => ({
        ...e,
        workTime: e.id === id ? time : e.workTime,
      })),
    );
  };

  const handleEmployeeChange = (id: number, employeeId: number) => {
    const findEmp = employees?.find((emp) => emp.id === employeeId);
    onChangeWorkCondition(
      dayOfWeek,
      _.map(entries, (e) => ({
        ...e,
        employee: e.id === id ? findEmp : e.employee,
      })),
    );
  };

  if (!employees) return null;

  return (
    <div className="p-4 border rounded-lg shadow bg-gray-50">
      <h3 className="mb-2 text-xl font-semibold text-center">{dayOfWeek}</h3>
      <ul>
        {/* position으로 파티션을 나누어 추가 삭제 기능을 구현 */}
        {EWORK_POSITION.map((po) => (
          <li key={po} className="mb-4">
            <div className="flex flex-col space-y-2">
              <h4 className="text-lg font-semibold">{po}</h4>
              {entries
                .filter((entry) => entry.workPosition === po)
                .map((entry) => (
                  <div key={entry.id}>
                    <label className="block text-sm font-medium text-gray-700">
                      근무 시간
                    </label>
                    <select
                      value={entry.workTime}
                      onChange={(e) =>
                        handleWorkTimeChange(
                          entry.id,
                          e.target.value as EWorkTime,
                        )
                      }
                      className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
                    >
                      {Object.values(EWorkTime).map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        직원
                      </label>
                      <select
                        value={entry.employee?.id ?? ''}
                        onChange={(e) =>
                          handleEmployeeChange(
                            entry.id,
                            parseInt(e.target.value),
                          )
                        }
                        className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
                      >
                        <option value={''}>직원 선택</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => handleRemoveEntry(entry.id)}
                      className="self-end w-20 py-2 mt-2 text-white bg-red-500 rounded-lg hover:text-red-700"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              <button
                onClick={() => handleAddEntry(po)}
                className="px-4 py-2 mt-2 text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600"
              >
                항목 추가
              </button>
            </div>
          </li>
        ))}
        {/* {entries.map((entry, idx) => (
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
                  value={entry.employee?.id ?? ''}
                  defaultValue={entry.employee?.id ?? ''}
                  onChange={(e) =>
                    handleEmployeeChange(idx, parseInt(e.target.value))
                  }
                  className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
                >
                  <option value={''}>직원 선택</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
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
        ))} */}
      </ul>
    </div>
  );
};

export default ScheduleEditor;
