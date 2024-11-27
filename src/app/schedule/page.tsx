'use client';

import { scheduleMutateApi } from '@/app/schedule/api/mutate';
import EmployeeSelector from '@/app/schedule/ui/EmployeeSelector';
import ScheduleDisplay from '@/app/schedule/ui/ScheduleDisplay';
import { useMutation } from '@tanstack/react-query';
import { NextPage } from 'next';
import React, { useState } from 'react';

interface Props {}

const SchedulePage: NextPage<Props> = ({}) => {
  const [employeeIds, setEmployeeIds] = useState<number[]>([]);
  const [maxSchedule, setMaxSchedule] = useState(5);

  const handleSelectionChange = (ids: number[]) => {
    setEmployeeIds(ids);
  };

  const {
    mutateAsync,
    isPending,
    isIdle,
    data: schedules,
  } = useMutation(scheduleMutateApi.generate);

  return (
    <React.Fragment>
      <div className="container p-4 mx-auto">
        <h1 className="mb-6 text-3xl font-bold text-center">근무표 생성기</h1>

        <EmployeeSelector onSelectionChange={handleSelectionChange} />

        {/* 최대 스케쥴 갯수 정하기 */}
        <div className="mb-6">
          <label className="font-bold" htmlFor="maxSchedule">
            최대 스케쥴 갯수 (해당 숫자 만큼의 스케쥴이 생성됩니다.)
          </label>
          <input
            type="number"
            id="maxSchedule"
            value={maxSchedule}
            max={100}
            onChange={(e) => setMaxSchedule(parseInt(e.target.value))}
            className="block w-32 bg-white p-2 border-[1px] rounded-lg"
          />
        </div>

        {/* 생성 버튼 */}
        <div className="text-center mb-6">
          <button
            disabled={isPending}
            onClick={async () => {
              await mutateAsync({ ids: employeeIds, maxSchedule });
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            근무표 생성
          </button>
        </div>

        <ScheduleDisplay
          schedules={schedules ?? []}
          isIdle={isIdle}
          isPending={isPending}
        />
      </div>
    </React.Fragment>
  );
};

export default SchedulePage;
