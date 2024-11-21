'use client';

import ErrorMessage from '@/app/employee/ui/ErrorMessage';
import { loginAction } from '@/app/login/action';
import { NextPage } from 'next';
import React, { FC } from 'react';
import { useFormState } from 'react-dom';

interface Props {}

const LoginPage: NextPage<Props> = ({}) => {
  const [state, action] = useFormState(loginAction, {});
  return (
    <div className="flex flex-col justify-center h-screen mx-auto max-w-80">
      <div className="px-4 py-6 mb-6 text-4xl font-bold text-white bg-blue-500 rounded-lg">
        <div>CGV 주안역</div>
        <div className="text-2xl">근무자 관리 프로그램</div>
      </div>
      <form
        action={action}
        className="flex flex-col gap-4 p-4 bg-gray-100 rounded-lg"
      >
        <div className="w-full mb-6 text-4xl font-bold text-center">로그인</div>
        <Input id="name" label={'이름'} />
        <ErrorMessage errors={state.errors?.name} />

        <Input id="password" label={'비밀번호'} type="password" />
        <ErrorMessage errors={state.errors?.password} />

        <ErrorMessage errors={state.message} />
        <button className="block w-full py-2 font-bold text-white bg-blue-500 rounded-lg">
          로그인
        </button>
      </form>
    </div>
  );
};

const Input: FC<
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
  }
> = (props) => {
  const { className, ...rest } = props;
  return (
    <div className="flex flex-col">
      <label className="font-bold" htmlFor={rest.id}>
        {rest.label}
      </label>
      <input
        {...rest}
        name={rest.id}
        className={`block w-full bg-white py-2 px-1 border-[1px] rounded-lg ${className}`}
      />
    </div>
  );
};

export default LoginPage;
