'use client';

import { SELECTED_WEEK } from '@/app/schedule/const';
import WeekPicker from '@/app/schedule/ui/generator/WeekPicker';
import WeeklyScheduleDisplay from '@/app/schedule/ui/WeeklySchedule';
import { useQueryParam } from '@/app/share/util/useQueryParam';
import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { DateDay } from '@/entity/interface/DateDay';
import { z } from 'zod';

const initDayOfWeek = EDayOfWeek.목;

const SchedulePage: React.FC = () => {
  const defaultDate = new DateDay(new Date(), 0).getPrevDateDayByDayOfWeek(
    initDayOfWeek,
  ).date;

  const [selectedWeek, setSelectedWeek] = useQueryParam(
    z.coerce.date().optional().default(defaultDate),
    SELECTED_WEEK,
  );

  const handleSelectWeek = (startDate: Date): void => {
    setSelectedWeek(startDate.toISOString());
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">근무 일정</h1>
      <WeekPicker selectedWeek={selectedWeek} onWeekSelect={handleSelectWeek} />
      <div className='h-10' />
      <WeeklyScheduleDisplay startDate={selectedWeek} schedule={{}} />
    </div>
  );
};

export default SchedulePage;
