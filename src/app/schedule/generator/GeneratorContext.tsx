'use client';

import { SELECTED_WEEK } from '@/app/schedule/const';
import { useQueryParam } from '@/app/share/util/useQueryParam';
import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import {
  EmployeeCondition,
  WorkConditionOfWeek,
  WorkConditionOfWeekSchema,
} from '@/entity/types';
import { WorkTimeSlot } from '@/feature/schedule/work-time-slot-handler';
import React, { useCallback, useState } from 'react';
import { z } from 'zod';

interface GeneratorContextType {
  selectedWeek: Date;
  workConditionOfWeek: WorkConditionOfWeek;
  selectEmployeeConditions: EmployeeCondition[];
  onChangeSelectEmployee: (employees: EmployeeCondition[]) => void;
  onChangeWorkConditionOfWeek: (
    newConditionOfWeek: WorkConditionOfWeek,
  ) => void;
  onChangeWorkConditionEntryWorkTime: (
    dayOfWeek: EDayOfWeek,
    entryId: string,
    workTime: EWorkTime,
  ) => void;
}

export const GeneratorContext = React.createContext<
  GeneratorContextType | undefined
>(undefined);

export const GeneratorProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [selectedWeek] = useQueryParam(z.coerce.date(), SELECTED_WEEK);
  const [workConditionOfWeek, setWorkConditionOfWeek] =
    useState<WorkConditionOfWeek>(WorkConditionOfWeekSchema.parse({}));
  const [selectEmployeeConditions, setSelectEmployeeConditions] = useState<
    EmployeeCondition[]
  >([]);

  const onChangeSelectEmployee = useCallback(
    (employees: EmployeeCondition[]) => {
      setSelectEmployeeConditions(employees);
    },
    [],
  );

  const onChangeWorkConditionOfWeek = useCallback(
    (newConditionOfWeek: WorkConditionOfWeek) => {
      setWorkConditionOfWeek(newConditionOfWeek);
    },
    [],
  );

  const onChangeWorkConditionEntryWorkTime = useCallback(
    (dayOfWeek: EDayOfWeek, entryId: string, workTime: EWorkTime) => {
      onChangeWorkConditionOfWeek({
        ...workConditionOfWeek,
        [dayOfWeek]: workConditionOfWeek[dayOfWeek].map((e) =>
          e.id === entryId
            ? { ...e, workTime, timeSlot: WorkTimeSlot.fromWorkTime(workTime) }
            : e,
        ),
      });
    },
    [onChangeWorkConditionOfWeek, workConditionOfWeek],
  );

  return (
    <GeneratorContext.Provider
      value={{
        selectedWeek,
        workConditionOfWeek,
        selectEmployeeConditions,
        onChangeSelectEmployee,
        onChangeWorkConditionOfWeek,
        onChangeWorkConditionEntryWorkTime,
      }}
    >
      {children}
    </GeneratorContext.Provider>
  );
};
