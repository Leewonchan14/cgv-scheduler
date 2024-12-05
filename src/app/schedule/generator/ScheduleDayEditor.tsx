import { employeeQueryApi } from '@/app/employee/api/queryoption';
import { scheduleMutateApi } from '@/app/schedule/api/mutate';
import {
  GeneratorContext,
  useGeneratorContext,
} from '@/app/schedule/generator/GeneratorContext';
import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { EWORK_POSITION, EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { DateDay } from '@/entity/interface/DateDay';
import { EmployeeCondition, WorkConditionEntry } from '@/entity/types';
import { WorkTimeSlot } from '@/feature/schedule/work-time-slot-handler';
import { getColor } from '@/share/libs/util/isLightColor';
import { uuid } from '@/share/libs/util/uuid';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import React, { useCallback, useContext } from 'react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilteredEmployees } from '@/feature/employee/with-schedule/filter-employee-condition';

interface ScheduleDayEditorProps {
  dayOfWeek: EDayOfWeek;
  hoverId: number;
  setHoverId: (_: number) => void;
}

const ScheduleDayEditor: React.FC<ScheduleDayEditorProps> = ({
  dayOfWeek,
  hoverId,
  setHoverId,
}) => {
  const context = useContext(GeneratorContext);
  if (!context) throw new Error('GeneratorContext가 존재하지 않습니다.');
  const { selectedWeek, workConditionOfWeek, onChangeWorkConditionOfWeek } =
    context;

  const addWorkConditionEntry = useCallback(
    (position: EWorkPosition) => {
      onChangeWorkConditionOfWeek({
        ...workConditionOfWeek,
        [dayOfWeek]: [
          ...workConditionOfWeek[dayOfWeek],
          {
            id: uuid(),
            date: DateDay.fromDayOfWeek(selectedWeek, dayOfWeek).date,
            workPosition: position,
            workTime: EWorkTime.오픈,
            timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
          },
        ],
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dayOfWeek, onChangeWorkConditionOfWeek, workConditionOfWeek],
  );

  return (
    <div className="p-2 border rounded-lg shadow bg-gray-50">
      <h3 className="mb-2 text-xl font-semibold text-center">
        {format(DateDay.fromDayOfWeek(selectedWeek, dayOfWeek).date, 'MM-dd')}{' '}
        {dayOfWeek}
      </h3>
      <ul>
        {/* position으로 파티션을 나누어 추가 삭제 기능을 구현 */}
        {EWORK_POSITION.map((po) => (
          <li key={po} className="mb-4">
            <div className="flex flex-col space-y-2">
              <h4 className="text-lg font-semibold">{po}</h4>
              {workConditionOfWeek[dayOfWeek]
                .filter((entry) => entry.workPosition === po)
                .map((entry) => (
                  <WorkEntryForm
                    key={entry.id}
                    dayOfWeek={dayOfWeek}
                    entry={entry}
                    hoverId={hoverId}
                    setHoverId={setHoverId}
                  />
                ))}
              <button
                onClick={() => addWorkConditionEntry(po)}
                className="mt-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                <span className="text-sm font-bold">✚ {po}</span>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface WorkEntryFormProps {
  dayOfWeek: EDayOfWeek;
  entry: WorkConditionEntry;
  hoverId: number;
  setHoverId: (_: number) => void;
}

const WorkEntryForm: React.FC<WorkEntryFormProps> = ({
  dayOfWeek,
  entry,
  hoverId,
  setHoverId,
}) => {
  const { data: employees } = useQuery(employeeQueryApi.findAll);
  const { workConditionOfWeek, onChangeWorkConditionOfWeek } =
    useGeneratorContext();

  const removeConditionEntry = (id: string) => {
    onChangeWorkConditionOfWeek({
      ...workConditionOfWeek,
      [dayOfWeek]: workConditionOfWeek[dayOfWeek].filter((e) => e.id !== id),
    });
  };

  const color = getColor(entry.employee?.id);
  const isHover = hoverId === entry.employee?.id;

  const bgColorHover = color.slice(0, -2);
  const bgColor = color;

  const getBg = () => {
    if (!entry.employee) return '';

    if (isHover) return bgColorHover;
    return bgColor;
  };

  if (!employees) return null;

  return (
    <React.Fragment>
      <div
        style={{
          backgroundColor: getBg(),
        }}
        className={`flex flex-col relative items-start px-2 py-1 pt-4 rounded-lg transition-transform duration-200
          ${isHover && 'transform scale-105'}`}
        onMouseEnter={() => setHoverId(entry.employee?.id ?? -1)}
        onMouseLeave={() => setHoverId(-1)}
      >
        <WorkTimeSelect dayOfWeek={dayOfWeek} entry={entry} />
        <EmployeeSelect dayOfWeek={dayOfWeek} entry={entry} />

        <button
          onClick={() => removeConditionEntry(entry.id)}
          className="absolute w-6 h-6 text-white align-middle bg-red-500 rounded-lg top-1 right-2 hover:text-red-700"
        >
          ✖
        </button>
      </div>
      <div className="border-b-2 border-black" />
    </React.Fragment>
  );
};

const WorkTimeSelect: React.FC<{
  dayOfWeek: EDayOfWeek;
  entry: WorkConditionEntry;
}> = ({ dayOfWeek, entry }) => {
  const { onChangeWorkConditionEntryWorkTime } = useGeneratorContext();
  return (
    <React.Fragment>
      <label className="block text-sm font-medium text-gray-700">
        근무 시간
      </label>
      <Select
        value={entry.workTime}
        onValueChange={(value) => {
          onChangeWorkConditionEntryWorkTime(
            dayOfWeek,
            entry.id,
            value as EWorkTime,
          );
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="오픈" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(EWorkTime).map((time) => (
            <SelectItem key={time} value={time}>
              {time}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </React.Fragment>
  );
};

type Label = keyof FilteredEmployees;

const EmployeeSelect: React.FC<{
  dayOfWeek: EDayOfWeek;
  entry: WorkConditionEntry;
}> = ({ entry, dayOfWeek }) => {
  const {
    workConditionOfWeek,
    onChangeWorkConditionOfWeek,
    getPossibleEmployeeBody,
  } = useGeneratorContext();

  const { data, isPending, mutate } = useMutation(
    scheduleMutateApi.possibleEmployee(getPossibleEmployeeBody(entry)),
  );
  const { data: employees } = useQuery(employeeQueryApi.findAll);

  const onChangeWorkConditionEntry = (
    id: string,
    entry: WorkConditionEntry,
  ) => {
    onChangeWorkConditionOfWeek({
      ...workConditionOfWeek,
      [dayOfWeek]: workConditionOfWeek[dayOfWeek].map((e) =>
        e.id === id ? entry : e,
      ),
    });
  };

  const initOrLoading = isPending || !data;

  if (!employees) return null;

  return (
    <div className="flex flex-col w-full">
      <label className="block text-sm font-medium text-gray-700">직원</label>
      <Select
        onOpenChange={(e) => {
          if (!e) return;
          mutate();
        }}
        onValueChange={(value) => {
          const employeeId = parseInt(value);
          const findEmp = employees.find((e) => e.id === employeeId);
          onChangeWorkConditionEntry(entry.id, {
            ...entry,
            employee: findEmp,
          });
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="자동 채우기" />
        </SelectTrigger>
        {initOrLoading && (
          <SelectContent>
            <div className="p-2 !flex gap-4 items-center">
              가능한 근무자 가져오는중
              <div className="mx-auto h-6 w-6 border-black border-t-2 border-t-blue-500 !rounded-full animate-spin"></div>
            </div>
          </SelectContent>
        )}
        {!initOrLoading && (
          <SelectContent className="text-nowrap">
            {Object.entries(data).map(([label, empCon]) => (
              <SelectGroup key={label}>
                <SelectLabel
                  className={`!pl-2 !font-bold ${(label as Label) === '가능한 근무자' ? 'text-green-500' : 'text-red-500'}`}
                >
                  {label}
                </SelectLabel>
                {(empCon as EmployeeCondition[]).map((emp) => (
                  <SelectItem
                    className=""
                    key={emp.employee.id}
                    value={String(emp.employee.id)}
                  >
                    {emp.employee.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        )}
      </Select>
    </div>
  );
};

export default ScheduleDayEditor;
