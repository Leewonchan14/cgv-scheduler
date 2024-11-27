import { EDAY_OF_WEEKS, EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { WorkConditionEntry, WorkConditionOfWeek } from '@/entity/types';

interface WeeklyScheduleProps {
  schedule: WorkConditionOfWeek;
  scheduleNumber: number;
}

const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({
  schedule,
  scheduleNumber,
}) => {
  return (
    <div className="mb-8">
      <h2 className="mb-4 text-2xl font-semibold">근무표 #{scheduleNumber}</h2>
      <div className="grid grid-cols-7 gap-4">
        {EDAY_OF_WEEKS.map((day) => (
          <DaySchedule key={day} day={day} entries={schedule[day] || []} />
        ))}
      </div>
    </div>
  );
};

interface DayScheduleProps {
  day: EDayOfWeek;
  entries: WorkConditionEntry[];
}

const DaySchedule: React.FC<DayScheduleProps> = ({ day, entries }) => {
  return (
    <div className="p-4 border rounded-lg shadow bg-gray-50">
      <h3 className="mb-2 text-xl font-semibold text-center">{day}</h3>
      <ul>
        {entries.map((entry, idx) => (
          <li key={idx} className="mb-2">
            <div className="flex flex-col">
              <span className="font-medium">{entry.workTime}</span>
              <span className="text-sm text-gray-700">
                {entry.workPosition}
              </span>
              <span className="text-sm text-gray-700">
                {entry.employee?.name}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WeeklySchedule;
