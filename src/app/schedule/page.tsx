'use client';

import ScheduleGeneratorForm from '@/app/schedule/ui/generator/ScheduleGeneratorForm';
import WeekPicker from '@/app/schedule/ui/generator/WeekPicker';
import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { DateDay } from '@/entity/interface/DateDay';
import { useState } from 'react';

const SchedulePage: React.FC = () => {
  const initDayOfWeek = EDayOfWeek.목;
  const [selectedWeek, setSelectedWeek] = useState<Date>(
    new DateDay(new Date(), 0).getNextDateDayByDayOfWeek(initDayOfWeek).date,
  );

  const handleWeekSelect = (startDate: Date) => {
    setSelectedWeek(startDate);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">근무표 관리</h1>
      <WeekPicker
        selectedWeek={selectedWeek}
        onWeekSelect={handleWeekSelect}
        initDayOfWeek={initDayOfWeek}
      />
      {selectedWeek && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            선택된 주:
            {selectedWeek.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h2>
          <ScheduleGeneratorForm startDate={selectedWeek} />
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
