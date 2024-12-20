'use client';

import { SELECTED_WEEK } from '@/app/schedule/const';
import { useQueryParam } from '@/app/share/util/useQueryParam';
import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import {
  APIPossibleEmployeeType,
  APIUserInputCondition,
  APIUserInputConditionSchema,
  EmployeeCondition,
  WorkConditionEntry,
  WorkConditionOfWeek,
  WorkConditionOfWeekSchema,
} from '@/entity/types';
import { WorkTimeSlot } from '@/feature/schedule/work-time-slot-handler';
import React, { useCallback, useContext, useState } from 'react';
import { z } from 'zod';

export interface ILimitCondition {
  maxSchedule: number;
  maxWorkComboDayCount: number;
  multiLimit: number;
}

export interface GeneratorContextType {
  selectedWeek: Date;
  workConditionOfWeek: WorkConditionOfWeek;
  selectEmployeeConditions: EmployeeCondition[];
  limitCondition: ILimitCondition;
  onChangeLimitCondition: (next: Partial<ILimitCondition>) => void;
  onChangeSelectEmployee: (employees: EmployeeCondition[]) => void;
  onChangeWorkConditionOfWeek: (
    newConditionOfWeek: WorkConditionOfWeek,
  ) => void;
  onChangeWorkConditionEntryWorkTime: (
    dayOfWeek: EDayOfWeek,
    entryId: string,
    workPosition: EWorkPosition,
    workTime: EWorkTime,
  ) => void;
  onChangeWorkConditionEntryTimeSlot: (
    dayOfWeek: EDayOfWeek,
    entryId: string,
    timeSlot: WorkTimeSlot,
  ) => void;
  getPossibleEmployeeBody: (
    workConditionEntry: WorkConditionEntry,
  ) => APIPossibleEmployeeType;
  getUserInput: () => APIUserInputCondition;
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

  const onChangeLimitCondition = useCallback(
    (next: Partial<ILimitCondition>) => {
      setLimitCondition((prev) => ({
        ...prev,
        ...next,
      }));
    },
    [],
  );

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
    (
      dayOfWeek: EDayOfWeek,
      entryId: string,
      workPosition: EWorkPosition,
      workTime: EWorkTime,
    ) => {
      onChangeWorkConditionOfWeek({
        ...workConditionOfWeek,
        [dayOfWeek]: workConditionOfWeek[dayOfWeek].map((e) =>
          e.id === entryId
            ? {
                ...e,
                workTime,
                timeSlot: WorkTimeSlot.fromWorkTime(workPosition, workTime),
              }
            : e,
        ),
      });
    },
    [onChangeWorkConditionOfWeek, workConditionOfWeek],
  );

  const onChangeWorkConditionEntryTimeSlot = useCallback(
    (dayOfWeek: EDayOfWeek, entryId: string, timeSlot: WorkTimeSlot) => {
      onChangeWorkConditionOfWeek({
        ...workConditionOfWeek,
        [dayOfWeek]: workConditionOfWeek[dayOfWeek].map((e) =>
          e.id === entryId ? { ...e, timeSlot } : e,
        ),
      });
    },
    [onChangeWorkConditionOfWeek, workConditionOfWeek],
  );

  const getUserInput = useCallback(() => {
    return APIUserInputConditionSchema.parse({
      employeeConditions: selectEmployeeConditions,
      workConditionOfWeek,
      startDate: selectedWeek,
      maxWorkComboDayCount: limitCondition.maxWorkComboDayCount,
      maxSchedule: limitCondition.maxSchedule,
      multiLimit: limitCondition.multiLimit,
    });
  }, [
    limitCondition.maxSchedule,
    limitCondition.maxWorkComboDayCount,
    limitCondition.multiLimit,
    selectEmployeeConditions,
    selectedWeek,
    workConditionOfWeek,
  ]);

  const getPossibleEmployeeBody = useCallback(
    (workConditionEntry: WorkConditionEntry) => {
      const { maxSchedule: _maxSchedule, ...rest } = getUserInput();
      return {
        ...rest,
        workConditionEntry,
      };
    },
    [getUserInput],
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
        onChangeWorkConditionEntryTimeSlot,
        getPossibleEmployeeBody,
        getUserInput,
      }}
    >
      {children}
    </GeneratorContext.Provider>
  );
};

export const useGeneratorContext = () => {
  const context = useContext(GeneratorContext);
  if (!context) {
    throw new Error('GeneratorContext가 존재하지 않습니다.');
  }
  return context;
};
