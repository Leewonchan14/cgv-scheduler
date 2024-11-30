import { employeeQueryApi } from '@/app/employee/api/queryoption';
import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { EWORK_POSITION, EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { DateDay } from '@/entity/interface/DateDay';
import { IEmployeeSchemaType, WorkConditionEntry } from '@/entity/types';
import { WorkTimeSlot } from '@/feature/schedule/work-time-slot-handler';
import { getColor } from '@/share/libs/util/isLightColor';
import { uuid } from '@/share/libs/util/uuid';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import _ from 'lodash';

interface DayEditorProps {
  dayOfWeek: EDayOfWeek;
  entries: WorkConditionEntry[];
  hoverId: number;
  setHoverId: (_: number) => void;
  onChangeWorkCondition: (_: EDayOfWeek, __: WorkConditionEntry[]) => void;
  selectedWeek: Date;
}

const DayEditor: React.FC<DayEditorProps> = ({
  dayOfWeek,
  hoverId,
  setHoverId,
  entries,
  onChangeWorkCondition,
  selectedWeek,
}) => {
  const { data: employees } = useQuery(employeeQueryApi.findAll);

  const handleAddEntry = (position: EWorkPosition) => {
    const newEntry: WorkConditionEntry = {
      id: uuid(),
      date: DateDay.fromDayOfWeek(selectedWeek, dayOfWeek).date,
      workPosition: position,
      workTime: EWorkTime.오픈,
      timeSlot: WorkTimeSlot.fromWorkTime(EWorkTime.오픈),
    };
    onChangeWorkCondition(dayOfWeek, [...entries, newEntry]);
  };

  const handleRemoveEntry = (id: string) => {
    const updatedEntries = entries.filter((e) => e.id !== id);
    onChangeWorkCondition(dayOfWeek, updatedEntries);
  };

  const handleWorkTimeChange = (id: string, time: EWorkTime) => {
    onChangeWorkCondition(
      dayOfWeek,
      _.map(entries, (e) => ({
        ...e,
        workTime: e.id === id ? time : e.workTime,
      })),
    );
  };

  const handleEmployeeChange = (id: string, employeeId: number) => {
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
              {entries
                .filter((entry) => entry.workPosition === po)
                .map((entry) => (
                  <WorkEntryForm
                    key={entry.id}
                    entry={entry}
                    hoverId={hoverId}
                    setHoverId={setHoverId}
                    employees={employees}
                    handleRemoveEntry={handleRemoveEntry}
                    handleWorkTimeChange={handleWorkTimeChange}
                    handleEmployeeChange={handleEmployeeChange}
                  />
                ))}
              <button
                onClick={() => handleAddEntry(po)}
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
  entry: WorkConditionEntry;
  employees: IEmployeeSchemaType[];
  hoverId: number;
  setHoverId: (_: number) => void;
  handleRemoveEntry: (_: string) => void;
  handleWorkTimeChange: (_: string, __: EWorkTime) => void;
  handleEmployeeChange: (_: string, __: number) => void;
}

const WorkEntryForm: React.FC<WorkEntryFormProps> = ({
  entry,
  employees,
  hoverId,
  setHoverId,
  handleEmployeeChange,
  handleRemoveEntry,
  handleWorkTimeChange,
}) => {
  const color = getColor(entry.employee?.id);
  const isHover = hoverId === entry.employee?.id;

  const bgColorHover = color.slice(0, -2);
  const bgColor = color;

  const getBg = () => {
    if (!entry.employee) return '';

    if (isHover) return bgColorHover;
    return bgColor;
  };
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
        onChange={(e) =>
          handleWorkTimeChange(entry.id, e.target.value as EWorkTime)
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
        <label className="block text-sm font-medium text-gray-700">직원</label>
        <select
          value={entry.employee?.id ?? ''}
          onChange={(e) =>
            handleEmployeeChange(entry.id, parseInt(e.target.value))
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
        className="absolute w-5 h-5 align-middle text-white bg-red-500 rounded-lg top-1 right-2 hover:text-red-700"
      >
        ✖
      </button>
    </div>
  );
};

export default DayEditor;
