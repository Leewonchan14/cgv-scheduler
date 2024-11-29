import ScheduleExplorer from '@/app/schedule/ui/ScheduleExplorer';
import React, { Suspense } from 'react';

const SchedulePage: React.FC = () => {
  return (
    <div className="container mx-auto">
      <Suspense>
        <ScheduleExplorer />
      </Suspense>
    </div>
  );
};

export default SchedulePage;
