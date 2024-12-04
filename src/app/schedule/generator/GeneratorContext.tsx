'use client';

import { SELECTED_WEEK } from '@/app/schedule/const';
import { useQueryParam } from '@/app/share/util/useQueryParam';
import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import {
  APIPossibleEmployeeType,
  EmployeeCondition,
  WorkConditionEntry,
  WorkConditionOfWeek,
  WorkConditionOfWeekSchema,
} from '@/entity/types';
import { WorkTimeSlot } from '@/feature/schedule/work-time-slot-handler';
import React, { useCallback, useState } from 'react';
import { z } from 'zod';

export interface GeneratorContextType {
  selectedWeek: Date;
  workConditionOfWeek: WorkConditionOfWeek;
  selectEmployeeConditions: EmployeeCondition[];
  limitCondition: {
    maxSchedule: number;
    maxWorkComboDayCount: number;
    multiLimit: number;
  };
  onChangeLimitCondition: (name: string, value: number) => void;
  onChangeSelectEmployee: (employees: EmployeeCondition[]) => void;
  onChangeWorkConditionOfWeek: (
    newConditionOfWeek: WorkConditionOfWeek,
  ) => void;
  onChangeWorkConditionEntryWorkTime: (
    dayOfWeek: EDayOfWeek,
    entryId: string,
    workTime: EWorkTime,
  ) => void;
  getPossibleEmployeeBody: (
    workConditionEntry: WorkConditionEntry,
  ) => APIPossibleEmployeeType;
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

  const [limitCondition, setLimitCondition] = useState({
    maxSchedule: 5,
    maxWorkComboDayCount: 3,
    multiLimit: 3,
  });

  const onChangeLimitCondition = useCallback((name: string, value: number) => {
    setLimitCondition((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

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

  const getPossibleEmployeeBody = useCallback(
    (workConditionEntry: WorkConditionEntry) => {
      return {
        workConditionOfWeek,
        startDate: selectedWeek,
        employeeConditions: selectEmployeeConditions,
        workConditionEntry,
        maxSchedule: limitCondition.maxSchedule,
        maxWorkComboDayCount: limitCondition.maxWorkComboDayCount,
        multiLimit: 3,
      } as APIPossibleEmployeeType;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      limitCondition.maxSchedule,
      limitCondition.maxWorkComboDayCount,
      selectEmployeeConditions,
      workConditionOfWeek,
    ],
  );

  return (
    <GeneratorContext.Provider
      value={{
        selectedWeek,
        workConditionOfWeek,
        selectEmployeeConditions,
        limitCondition,
        onChangeLimitCondition,
        onChangeSelectEmployee,
        onChangeWorkConditionOfWeek,
        onChangeWorkConditionEntryWorkTime,
        getPossibleEmployeeBody,
      }}
    >
      {children}
    </GeneratorContext.Provider>
  );
};
