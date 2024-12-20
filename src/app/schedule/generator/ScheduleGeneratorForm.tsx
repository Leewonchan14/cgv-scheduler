'use client';

import { scheduleMutateApi } from '@/app/schedule/api/mutate';
import EmployeeSelector from '@/app/schedule/generator/EmployeeSelector';
import { useGeneratorContext } from '@/app/schedule/generator/GeneratorContext';
import ScheduleGenDisplay from '@/app/schedule/generator/ScheduleDisplay';
import ScheduleWeekEditor from '@/app/schedule/generator/ScheduleWeekEditor';
import { useIsMutating, useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { NextPage } from 'next';
import React, { useState } from 'react';

const ScheduleGeneratorForm: NextPage<{}> = ({}) => {
  const [message, setMessage] = useState('');

  const { getUserInput, limitCondition, onChangeLimitCondition } =
    useGeneratorContext();

  const { data: generatedSchedules, mutateAsync } = useMutation(
    scheduleMutateApi.generate,
  );

  const onSubmit = async () => {
    setMessage('');
    await mutateAsync(getUserInput(), {
      onError: (error) => {
        console.log(error);
        let newMessage = error.message;
        if (error instanceof AxiosError) {
          if (error?.response?.data?.message === 'Timeout') {
            newMessage =
              '시간 제한... 먼저 근무자를 어느정도 배치후 시도해 보세요';
          } else {
            newMessage = `${error.request.status}서버 오류입니다. 잠시후 다시시도해 보세요`;
          }
        }
        setMessage(newMessage);
      },
    });
  };

  return (
    <div className="container mx-auto">
      <ScheduleWeekEditor />

      <EmployeeSelector />

      {/* 최대 스케쥴 갯수 정하기 */}
      <ScheduleInputNumber
        value={limitCondition.maxSchedule}
        setValue={(v) => onChangeLimitCondition({ maxSchedule: v })}
        name="maxSchedule"
        text="최대 스케쥴 갯수 (해당 숫자 만큼의 스케쥴이 생성됩니다.)"
      />

      {/* 최대 연속 근무 일 정하기 */}
      <ScheduleInputNumber
        value={limitCondition.maxWorkComboDayCount}
        setValue={(v) => onChangeLimitCondition({ maxWorkComboDayCount: v })}
        name="maxWorkComboDayCount"
        text="최대 연속 근무 일 (해당 숫자 만큼만 근무자가 연속으로 근무 가능합니다.)"
      />

      {/* 최초 멀티 조건 정하기 */}
      <ScheduleInputNumber
        value={limitCondition.multiLimit}
        setValue={(v) => onChangeLimitCondition({ multiLimit: v })}
        name="multiLimit"
        text="최소 멀티 인원 조건(멀티 근무자 시간에 해당 숫자 이상의 (멀티 + 플로어)근무자가 근무해야 합니다.)"
      />

      {/* 생성 버튼 */}
      <GenerateButton onClick={onSubmit} message={message} />

      <ScheduleGenDisplay schedules={generatedSchedules ?? []} />
    </div>
  );
};

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
      </label>
      <input
        type="number"
        id={name}
        value={value}
        max={100}
        onChange={(e) => {
          setValue(parseInt(e.target.value) || 0);
        }}
        className="block w-32 bg-white p-2 border-[1px] rounded-lg"
      />
    </div>
  );
};

interface ButtonProps {
  onClick: () => void;
  message: string;
}

const GenerateButton: React.FC<ButtonProps> = ({ onClick, message }) => {
  const disable = useIsMutating(scheduleMutateApi.generate) !== 0;
  return (
    <div className="flex flex-col items-center gap-4 mb-6 text-center">
      <button
        disabled={disable}
        onClick={onClick}
        className="px-4 py-2 font-bold text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        자동 근무표 생성
      </button>
      <p className="font-bold text-red-500">{message}</p>
    </div>
  );
};

export default ScheduleGeneratorForm;
