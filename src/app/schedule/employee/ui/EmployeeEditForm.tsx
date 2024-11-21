'use client';

import { FormState } from '@/app/schedule/employee/action';
import AbleWorkPosition from '@/app/schedule/employee/ui/AbleWorkPosition';
import AbleWorkTime from '@/app/schedule/employee/ui/AbleWorkTime';
import ErrorMessage from '@/app/schedule/employee/ui/ErrorMessage';
import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { IAbleWorkTime } from '@/entity/enums/EWorkTime';
import { NextPage } from 'next';
import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

interface Props {
  id?: number;
  name?: string;
  workPositions?: EWorkPosition[];
  ableWorkTime?: IAbleWorkTime;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}

const EmployeeEditForm: NextPage<Props> = ({
  id,
  name,
  ableWorkTime: initWorkTime,
  workPositions: initPositions,
  action,
}) => {
  const [ableWorkPosition, setAbleWorkPosition] = useState<EWorkPosition[]>(
    initPositions ?? [],
  );
  const [ableWorkTime, setAbleWorkTime] = useState<IAbleWorkTime>(
    initWorkTime ?? {},
  );
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-10">
      {/* 근무자 이름 작성 */}
      <div className="flex flex-col items-start">
        <label htmlFor="name" className="text-xl font-bold">
          근무자 이름
        </label>
        <span className="my-2 font-bold text-red-400">
          근무자 이름은 중복이 허용됩니다. (근무표 가독성을 위해 중복을 피해주세요)
        </span>
        <input
          required
          className="p-2 border-2 rounded-lg min-w-64"
          id="name"
          name="name"
          placeholder="근무자 이름을 입력해 주세요"
          defaultValue={name ?? ''}
        />

        <ErrorMessage errors={state.errors?.name} />
      </div>
      {/* 가능한 근무 포지션 작성 */}
      <div className="flex flex-col items-start gap-4">
        <label className="text-xl font-bold">가능한 근무</label>
        <span className="">
          근무자가 가능한 포지션을 선택해 주세요. (복수 선택 가능)
        </span>
        <AbleWorkPosition
          ableWorkPosition={ableWorkPosition}
          setAbleWorkPosition={setAbleWorkPosition}
        />
        <ErrorMessage errors={state.errors?.ableWorkPosition} />
      </div>
      <div className="flex flex-col">
        <label className="text-xl font-bold">가능한 시간</label>
        <span className="my-2">
          근무자가 출근 가능한 날을 선택해 주세요. (복수 선택 가능)
        </span>

        <AbleWorkTime
          ableWorkTime={ableWorkTime}
          setAbleWorkTime={setAbleWorkTime}
        />

        <ErrorMessage errors={state.errors?.ableWorkTime} />
      </div>
      <input type="hidden" name="id" value={id} />
      <input
        type="hidden"
        name="ableWorkPosition"
        value={JSON.stringify(ableWorkPosition)}
      />
      <input
        type="hidden"
        name="ableWorkTime"
        value={JSON.stringify(ableWorkTime)}
      />

      <SubmitButton />
    </form>
  );
};

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <div className="flex items-center w-full gap-10 text-2xl font-bold">
      <button
        disabled={pending}
        type="submit"
        className={`px-4 py-2 bg-blue-500 text-white rounded-md ${pending && 'opacity-50'}`}
      >
        확인
      </button>
      {pending && '로딩중 ...'}
    </div>
  );
};

export default EmployeeEditForm;
