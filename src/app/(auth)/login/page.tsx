'use client';

import { adminDevLogin, loginAction } from '@/app/(auth)/login/action';
import ErrorMessage from '@/app/employee/ui/ErrorMessage';
import { NextPage } from 'next';
import React, { FC } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

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
        <ErrorMessage errors={state?.errors?.name} />

        <Input id="password" label={'비밀번호'} type="password" />
        <ErrorMessage errors={state?.errors?.password} />

        <ErrorMessage errors={state?.message} />
        <LoginButton />
      </form>

      <form action={adminDevLogin}>
        <button type="submit">개발용 관리자 로그인하기</button>
      </form>
    </div>
  );
};

const Input: FC<
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
  }
> = (props) => {
  const { pending } = useFormStatus();

  const { className, ...rest } = props;
  return (
    <div className="flex flex-col">
      <label className="font-bold" htmlFor={rest.id}>
        {rest.label}
      </label>
      <input
        disabled={pending}
        {...rest}
        name={rest.id}
        className={`block w-full bg-white py-2 px-1 border-[1px] rounded-lg ${className} ${pending && 'opacity-50 cursor-not-allowed'}`}
      />
    </div>
  );
};

const LoginButton: FC<{}> = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex justify-center items-center w-full py-2 font-bold text-white bg-blue-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      로그인
      {pending && (
        <div className="inline-block animate-spin border-2 border-white rounded-full w-4 h-4 ml-2 border-t-blue-500" />
      )}
    </button>
  );
};

export default LoginPage;
