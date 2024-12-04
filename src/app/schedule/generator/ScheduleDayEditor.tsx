import { employeeQueryApi } from '@/app/employee/api/queryoption';
import { scheduleMutateApi } from '@/app/schedule/api/mutate';
import { GeneratorContext } from '@/app/schedule/generator/GeneratorContext';
import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { EWORK_POSITION, EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { DateDay } from '@/entity/interface/DateDay';
import { WorkConditionEntry } from '@/entity/types';
import { WorkTimeSlot } from '@/feature/schedule/work-time-slot-handler';
import { getColor } from '@/share/libs/util/isLightColor';
import { uuid } from '@/share/libs/util/uuid';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useCallback, useContext } from 'react';

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
  const context = useContext(GeneratorContext);
  if (!context) throw new Error('GeneratorContext가 존재하지 않습니다.');
  const {
    workConditionOfWeek,
    onChangeWorkConditionOfWeek,
    onChangeWorkConditionEntryWorkTime,
    getPossibleEmployeeBody,
  } = context;

  const { data: employees } = useQuery(employeeQueryApi.findAll);
  const { mutateAsync } = useMutation(
    scheduleMutateApi.possibleEmployee(getPossibleEmployeeBody(entry)),
  );

  const removeConditionEntry = (id: string) => {
    onChangeWorkConditionOfWeek({
      ...workConditionOfWeek,
      [dayOfWeek]: workConditionOfWeek[dayOfWeek].filter((e) => e.id !== id),
    });
  };

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
    <div
      style={{
        backgroundColor: getBg(),
      }}
      className={`flex flex-col relative items-start px-2 py-1 rounded-lg transition-transform duration-200
          ${isHover && 'transform scale-105'}`}
      onMouseEnter={() => setHoverId(entry.employee?.id ?? -1)}
      onMouseLeave={() => setHoverId(-1)}
    >
      <label className="block text-sm font-medium text-gray-700">
        근무 시간
      </label>
      <select
        value={entry.workTime}
        onChange={(e) => {
          onChangeWorkConditionEntryWorkTime(
            dayOfWeek,
            entry.id,
            e.target.value as EWorkTime,
          );
        }}
        className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
      >
        {Object.values(EWorkTime).map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>
      <div>
        <label className="block text-sm font-medium text-gray-700">직원</label>
        <select
          value={entry.employee?.id ?? ''}
          onChange={(e) => {
            const employeeId = parseInt(e.target.value);
            const findEmp = employees.find((e) => e.id === employeeId);
            onChangeWorkConditionEntry(entry.id, {
              ...entry,
              employee: findEmp,
            });
          }}
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
        onClick={async () => {
          const data = await mutateAsync();
          console.log(data);
        }}
        className="bg-blue-500 rounded-lg px-4 py-2 text-white hover:bg-blue-400 font-bold"
      >
        가능한 근무자 보기
      </button>
      <button
        onClick={() => removeConditionEntry(entry.id)}
        className="absolute w-5 h-5 align-middle text-white bg-red-500 rounded-lg top-1 right-2 hover:text-red-700"
      >
        ✖
      </button>
    </div>
  );
};

export default ScheduleDayEditor;
