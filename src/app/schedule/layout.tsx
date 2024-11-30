import SideNavLayout from '@/app/ui/sidenav/SideNavLayout';
import { NextPage } from 'next';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

const ScheduleLayout: NextPage<Props> = async ({ children }) => {
  return (
    <SideNavLayout>
      <div className="p-4 md:p-10">{children}</div>
    </SideNavLayout>
  );
};

export default ScheduleLayout;
