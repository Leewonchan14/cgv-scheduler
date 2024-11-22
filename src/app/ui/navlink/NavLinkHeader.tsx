'use client';

import { NextPage } from 'next';
import { usePathname } from 'next/navigation';

// const NAV_LINKS = [
//   { name: '근무자 관리', href: '/employee' },
//   { name: '근무자 추가', href: '/employee/create' },
//   { name: '근무자 수정', href: '/employee/*/update' },
// ] as const;

interface Props {}

const NavLinkHeader: NextPage<Props> = ({}) => {
  usePathname();
  return <div></div>;
};

export default NavLinkHeader;
