'use client';

import { employeeRemoveAction } from '@/app/employee/action';
import { NextPage } from 'next';
import React, { useState } from 'react';

interface Props {
  id: number;
  name: string;
  isAdmin: boolean;
}

const DeleteButton: NextPage<Props> = ({ id, name, isAdmin }) => {
  const [isClick, setIsClick] = useState(false);
  return (
    <button
      disabled={isClick}
      onClick={async () => {
        const isTrue = window.confirm(
          `${name}님을 삭제 하시겠습니까?\n삭제 후 같은 이름으로 다시 등록할 수 없습니다.`,
        );

        if (!isTrue) return;

        setIsClick(true);
        await employeeRemoveAction({ id });
      }}
      className={`flex justify-center items-center w-20 px-4 h-12 text-white bg-red-500 border-2 rounded-lg ${!isAdmin && 'invisible'}`}
    >
      {isClick ? (
        <div className="w-5 h-5 border-2 rounded-full border-red-500 border-t-white animate-spin" />
      ) : (
        '삭제'
      )}
    </button>
  );
};

export default DeleteButton;
