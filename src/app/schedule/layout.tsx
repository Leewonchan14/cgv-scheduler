import { SideNav } from '@/share/ui/sidenav/sidenav';
import { NextPage } from 'next';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

const ScheduleLayout: NextPage<Props> = ({ children }) => {
  return (
    <React.Fragment>
      <SideNav />
      <div className="p-10 ml-sidenav-width">{children}</div>
    </React.Fragment>
  );
};

export default ScheduleLayout;
