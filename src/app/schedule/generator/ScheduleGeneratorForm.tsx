'use client';

import { scheduleMutateApi } from '@/app/schedule/api/mutate';
import { SELECTED_WEEK } from '@/app/schedule/const';
import EmployeeSelector from '@/app/schedule/generator/EmployeeSelector';
import ScheduleGenDisplay from '@/app/schedule/generator/ScheduleDisplay';
import ScheduleEditor from '@/app/schedule/generator/ScheduleEditor';
import { useQueryParam } from '@/app/share/util/useQueryParam';
import {
  APIUserInputConditionSchema,
  EmployeeCondition,
  WorkConditionOfWeek,
} from '@/entity/types';
import { useMutation } from '@tanstack/react-query';
import { NextPage } from 'next';
import React, { useState } from 'react';
import { z } from 'zod';

interface Props {}

const ScheduleGeneratorForm: NextPage<Props> = ({}: Props) => {
  // 선택된 주
  const [selectedWeek] = useQueryParam(z.coerce.date(), SELECTED_WEEK);

  const [workConditionOfWeek, setWorkConditionOfWeek] =
    useState<WorkConditionOfWeek>({});

  const [selectEmployeeConditions, setSelectEmployeeConditions] = useState<
    EmployeeCondition[]
  >([]);

  // 최대 스케쥴 갯수
  const [maxSchedule, setMaxSchedule] = useState(5);

  // 최대 연속 근무 일
  const [maxWorkComboDayCount, setMaxWorkComboDayCount] = useState(3);

  const {
    data: schedules,
    mutateAsync,
    isPending,
    reset,
  } = useMutation(scheduleMutateApi.generate);

  const handleEmployeeSelectionChange = (employees: EmployeeCondition[]) => {
    setSelectEmployeeConditions(employees);
  };

  const handleChangeWorkCondition = (newConditions: WorkConditionOfWeek) => {
    setWorkConditionOfWeek(newConditions);
  };

  const handleSetWorkCondition = (newConditions: WorkConditionOfWeek) => {
    handleChangeWorkCondition(newConditions);
    reset();
  };

  const onSubmit = async () => {
    const parse = APIUserInputConditionSchema.parse({
      employeeConditions: selectEmployeeConditions,
      workConditionOfWeek,
      maxWorkComboDayCount,
      startDate: selectedWeek,
      maxSchedule,
    });
    await mutateAsync(parse);
  };

  return (
    <div className="container mx-auto">
      <ScheduleEditor
        selectedWeek={selectedWeek}
        workConditionOfWeek={workConditionOfWeek}
        handleChangeWorkCondition={handleChangeWorkCondition}
      />

      <h1 className="my-10 text-3xl font-bold">근무표 자동 생성</h1>

      <EmployeeSelector
        selectEmployeeConditions={selectEmployeeConditions}
        onSelectionChange={handleEmployeeSelectionChange}
      />

      {/* 최대 스케쥴 갯수 정하기 */}
      <ScheduleInputNumber
        value={maxSchedule}
        setValue={(v) => setMaxSchedule(v)}
        name="maxSchedule"
        text="최대 스케쥴 갯수 (해당 숫자 만큼의 스케쥴이 생성됩니다.)"
      />

      {/* 최대 연속 근무 일 정하기 */}
      <ScheduleInputNumber
        value={maxWorkComboDayCount}
        setValue={setMaxWorkComboDayCount}
        name="maxWorkComboDayCount"
        text="최대 연속 근무 일 (해당 숫자 만큼만 근무자가 연속으로 근무 가능합니다.)"
      />

      {/* 생성 버튼 */}
      <GenerateButton disable={isPending} onClick={onSubmit} />

      <ScheduleGenDisplay
        startDate={selectedWeek}
        schedules={schedules ?? []}
        isLoading={isPending}
        handleSetWorkCondition={handleSetWorkCondition}
      />
    </div>
  );
};

// 최대 스케쥴 갯수 정하기
const ScheduleInputNumber: React.FC<{
  name: string;
  text: string;
  value: number;
  setValue: (_: number) => void;
}> = ({ value, setValue, text, name }) => {
  return (
    <div className="my-6">
      <label className="font-bold" htmlFor={name}>
        {text}
        {/* 최대 스케쥴 갯수 (해당 숫자 만큼의 스케쥴이 생성됩니다.) */}
      </label>
      <input
        type="number"
        id={name}
        value={value}
        max={100}
        onChange={(e) => setValue(parseInt(e.target.value))}
        className="block w-32 bg-white p-2 border-[1px] rounded-lg"
      />
    </div>
  );
};

const GenerateButton: React.FC<{ disable: boolean; onClick: () => void }> = ({
  disable,
  onClick,
}) => {
  return (
    <div className="mb-6 text-center">
      <button
        disabled={disable}
        onClick={onClick}
        className="px-4 py-2 font-bold text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        자동 근무표 생성
      </button>
    </div>
  );
};

export default ScheduleGeneratorForm;
