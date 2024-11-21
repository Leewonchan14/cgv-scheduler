import { toggleListItem } from '@/share/libs/util/toggle-list-item';
import { DayOfWeek } from '@/typeorm/enum/DayOfWeek';
import { FC } from 'react';

interface Props {
  fixedDayOff: DayOfWeek[];
  setFixedDayOff: React.Dispatch<React.SetStateAction<DayOfWeek[]>>;
}

const FixedDayOf: FC<Props> = ({ fixedDayOff, setFixedDayOff }) => {
  return (
    <div className="flex gap-4">
      {Object.values(DayOfWeek).map((day) => (
        <button
          type="button"
          onClick={() => setFixedDayOff((prev) => toggleListItem(prev, day, (a) => a))}
          className={`px-4 py-2 bg-gray-200 rounded-md ${fixedDayOff.includes(day) && '!bg-blue-500 text-white'}`}
          key={day}
        >
          {day}
        </button>
      ))}
    </div>
  );
};

export default FixedDayOf;
