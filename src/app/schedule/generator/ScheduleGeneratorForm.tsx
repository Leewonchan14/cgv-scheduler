'use client';

import { scheduleMutateApi } from '@/app/schedule/api/mutate';
import EmployeeSelector from '@/app/schedule/generator/EmployeeSelector';
import { GeneratorContext } from '@/app/schedule/generator/GeneratorContext';
import ScheduleGenDisplay from '@/app/schedule/generator/ScheduleDisplay';
import ScheduleWeekEditor from '@/app/schedule/generator/ScheduleWeekEditor';
import { APIUserInputConditionSchema } from '@/entity/types';
import { useIsMutating, useMutation } from '@tanstack/react-query';
import { NextPage } from 'next';
import React, { useContext, useState } from 'react';

const ScheduleGeneratorForm: NextPage<{}> = ({}) => {
  const context = useContext(GeneratorContext);
  if (!context) {
    throw new Error('GeneratorContext가 존재하지 않습니다.');
  }
  // 최대 스케쥴 갯수
  const [maxSchedule, setMaxSchedule] = useState(5);
  // 최대 연속 근무 일
  const [maxWorkComboDayCount, setMaxWorkComboDayCount] = useState(3);

  const { data: generatedSchedules, mutateAsync } = useMutation(
    scheduleMutateApi.generate,
  );

  const onSubmit = async () => {
    const parse = APIUserInputConditionSchema.parse({
      employeeConditions: context.selectEmployeeConditions,
      workConditionOfWeek: context.workConditionOfWeek,
      maxWorkComboDayCount,
      startDate: context.selectedWeek,
      maxSchedule,
    });
    await mutateAsync(parse);
  };

  return (
    <div className="container mx-auto">
      <ScheduleWeekEditor />

      <h1 className="my-10 text-3xl font-bold">근무표 자동 생성</h1>

      <EmployeeSelector />

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
      <GenerateButton onClick={onSubmit} />

      <ScheduleGenDisplay schedules={generatedSchedules ?? []} />
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

const GenerateButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const disable = useIsMutating(scheduleMutateApi.generate) !== 0;
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
