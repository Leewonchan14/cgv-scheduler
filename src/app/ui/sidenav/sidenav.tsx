'use client';

import { NextPage } from 'next';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { FC, Suspense, useState } from 'react';

enum NAV_ENUM {
  employee = 'employee',
  schedule = 'schedule',
}

const NAV_LINKS: {
  [key in NAV_ENUM]: { name: string; path: string };
} = {
  employee: {
    name: '근무자 관리',
    path: '/employee',
  },
  schedule: {
    name: '근무 일정',
    path: '/schedule',
  },
} as const;

interface Props {}

const Sidenav: NextPage<Props> = ({}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <React.Fragment>
      <div
        className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10 md:hidden ${!isOpen && 'hidden'}`}
        onClick={() => setIsOpen(false)}
      />
      <div
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-5 left-5 w-12 h-12 flex items-center justify-center bg-white border-2 border-gray-700 z-20 cursor-pointer rounded-lg visible md:invisible ${isOpen && 'hidden'}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </div>
      <div
        className={`fixed h-screen px-6 transition-transform duration-300 ease-in-out -translate-x-full bg-gray-100 min-w-sidenav-width md:translate-x-0 z-10 ${isOpen && 'translate-x-0'}`}
      >
        <Link
          className="flex flex-col gap-4 my-12 font-bold"
          href={'/employee'}
        >
          <div className="text-2xl">CGV 주안역</div>
          <div className="text-xl">근무자 관리 프로그램</div>
        </Link>
        <div className="flex flex-col gap-6">
          <Suspense>
            <SideLink nav={NAV_ENUM.employee} />
            <SideLink nav={NAV_ENUM.schedule} />
          </Suspense>
        </div>
      </div>
    </React.Fragment>
  );
};

const SideLink: FC<{ nav: NAV_ENUM }> = ({ nav }) => {
  const { name, path } = NAV_LINKS[nav];
  const searchParam = useSearchParams();

  const preQuery = new URLSearchParams(
    Object.fromEntries(searchParam.entries()),
  ).toString();

  const isActive = path === usePathname();
  return (
    <Link
      className={`bg-gray-300 p-4 rounded-lg font-bold ${isActive && '!bg-blue-500 text-white'}`}
      href={`${path}?${preQuery}`}
    >
      <div className="">{name}</div>
    </Link>
  );
};

export default Sidenav;
