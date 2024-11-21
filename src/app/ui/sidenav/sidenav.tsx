'use client';

import { NextPage } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC } from 'react';

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
  const pathname = usePathname();
  const page = Object.entries(NAV_LINKS).find(
    ([_, { path }]) => path === pathname,
  );

  return (
    <div className="fixed h-screen bg-gray-100 min-w-sidenav-width px-6">
      <Link className="flex flex-col gap-4 my-12 font-bold" href={'/employee'}>
        <div className="text-5xl">CGV 주안역</div>
        <div className="text-2xl">근무자 관리 프로그램</div>
      </Link>
      <div className="flex flex-col gap-6">
        <SideLink nav={NAV_ENUM.employee} />
        <SideLink nav={NAV_ENUM.schedule} />
      </div>
    </div>
  );
};

const SideLink: FC<{ nav: NAV_ENUM }> = ({ nav }) => {
  const { name, path } = NAV_LINKS[nav];
  const isActive = path === usePathname();
  return (
    <Link
      className={`bg-gray-300 p-4 rounded-lg font-bold ${isActive && '!bg-blue-500 text-white'}`}
      href={path}
    >
      <div className="">{name}</div>
    </Link>
  );
};

export default Sidenav;
