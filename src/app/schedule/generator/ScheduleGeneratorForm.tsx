'use client';

import { scheduleMutateApi } from '@/app/schedule/api/mutate';
import EmployeeSelector from '@/app/schedule/generator/EmployeeSelector';
import { useGeneratorContext } from '@/app/schedule/generator/GeneratorContext';
import ScheduleGenDisplay from '@/app/schedule/generator/ScheduleDisplay';
import ScheduleWeekEditor from '@/app/schedule/generator/ScheduleWeekEditor';
import { DateDay } from '@/entity/interface/DateDay';
import { ScheduleErrorCounter } from '@/feature/schedule/schedule-error-counter';
import { useIsMutating, useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { NextPage } from 'next';
import React, { useState } from 'react';

const ScheduleGeneratorForm: NextPage<{}> = ({}) => {
  const { getUserInput, limitCondition, onChangeLimitCondition } =
    useGeneratorContext();

  const { data: generatedSchedules, mutateAsync } = useMutation(
    scheduleMutateApi.generate,
  );

  const onSubmit = async (
    onMutate: () => void,
    onError: (error: Error) => void,
  ) => {
    onMutate();
    await mutateAsync(getUserInput(), {
      onError,
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
        text={
          <div className="">
            <div className="text-red-500">
              {'<'}멀티 근무자가 있을때만 적용되는 조건{'>'}
            </div>
            최소 멀티 인원 조건(각 요일에 멀티 가능 근무자가 해당 수 이상 만큼
            배치되어야 합니다.)
          </div>
        }
      />

      {/* 생성 버튼 */}
      <GenerateButton onClick={onSubmit} />

      <ScheduleGenDisplay schedules={generatedSchedules?.data ?? []} />
    </div>
  );
};

const ScheduleInputNumber: React.FC<{
  name: string;
  text: React.ReactNode;
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
  onClick: (
    onMutate: () => void,
    onError: (error: Error) => void,
  ) => Promise<void>;
}

const GenerateButton: React.FC<ButtonProps> = ({ onClick }) => {
  const [counter, setCounter] = useState<ScheduleErrorCounter['counter']>();
  const [message, setMessage] = useState('');
  const onSubmit = async () => {
    await onClick(
      () => {
        setCounter(undefined);
        setMessage('');
      },
      (error) => {
        console.log(error);
        let newMessage = error.message;
        if (error instanceof AxiosError) {
          if (error.request.status === 400) {
            newMessage = '';
            setCounter(
              error?.response?.data?.counter as ScheduleErrorCounter['counter'],
            );
          } else {
            newMessage = `${error.request.status}서버 오류입니다. 잠시후 다시시도해 보세요`;
          }
        }
        setMessage(newMessage);
      },
    );
  };

  const disable = useIsMutating(scheduleMutateApi.generate) !== 0;
  return (
    <div className="flex flex-col items-center gap-4 mb-6 text-center">
      <button
        disabled={disable}
        onClick={onSubmit}
        className="px-4 py-2 font-bold text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        자동 근무표 생성
      </button>
      <p className="font-bold text-red-500">{message}</p>
      <DisplayErrorCounter counter={counter} />
    </div>
  );
};

const DisplayErrorCounter = ({
  counter,
}: {
  counter?: ScheduleErrorCounter['counter'];
}) => {
  const { workConditionOfWeek, selectEmployeeConditions } =
    useGeneratorContext();

  if (!counter) return null;

  const entries = Object.values(workConditionOfWeek).flat();

  const renderEntry = (entryId: string) => {
    const entry = entries.find((entry) => entry.id === entryId);
    if (!entry) return;

    return (
      <div key={entryId} className="flex w-full gap-4 font-bold text-red-500">
        <div>{new DateDay(entry.date, 0).getDayOfWeek()}요일</div>
        <div>{entry.workPosition}</div>
        <div>{entry.workTime}</div>
        <div>{`${entry.timeSlot.start} ~ ${entry.timeSlot.end}`}</div>
      </div>
    );
  };

  const renderEmployeeNotValid = (id: number) => {
    const employeeCon = selectEmployeeConditions.find(
      (emp) => emp.employee.id === id,
    );
    if (!employeeCon) return;
    return (
      <div key={id} className="font-bold text-red-500">
        {employeeCon.employee.name}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col items-start gap-2">
        <div>가능한 근무자가 없었던 근무표</div>
        {Object.keys(counter['가능한 근무자가 없었던 근무표']).map(
          (id, index) => (
            <div className="flex" key={id}>
              <span className="mr-2">{index + 1}.</span>
              {renderEntry(id)}
            </div>
          ),
        )}
      </div>
      <div className="flex flex-wrap gap-4">
        <div>최대 근무일이 적어서 배치가 힘든 근무자</div>
        {Object.keys(counter['최대 근무일이 적어서 배치가 힘든 근무자']).map(
          (id) => renderEmployeeNotValid(parseInt(id)),
        )}
      </div>
      <div className="flex flex-wrap gap-4">
        <div>최소 근무일이 많아서 배치가 힘든 근무자</div>
        {Object.keys(counter['최소 근무일이 많아서 배치가 힘든 근무자']).map(
          (id) => renderEmployeeNotValid(parseInt(id)),
        )}
      </div>
    </div>
  );
};

export default ScheduleGeneratorForm;
