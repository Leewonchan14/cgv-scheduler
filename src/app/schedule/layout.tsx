import Sidenav from '@/app/ui/sidenav/sidenav';
import { ERole } from '@/entity/enums/ERole';
import { withAuth } from '@/feature/auth';
import { NextPage } from 'next';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

const ScheduleLayout: NextPage<Props> = async ({ children }) => {
  await withAuth([ERole.EMPLOYEE, ERole.ADMIN]);
  return (
    <div className="">
      <Sidenav />
      <div className="p-10 ml-sidenav-width">{children}</div>
    </div>
  );
};

export default ScheduleLayout;
