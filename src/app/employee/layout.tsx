import Sidenav from '@/app/ui/sidenav/sidenav';
import { NextPage } from 'next';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

const EmployeeLayout: NextPage<Props> = ({ children }) => {
  return (
    <div className="">
      <Sidenav />
      <div className="p-10 ml-sidenav-width">{children}</div>
    </div>
  );
};

export default EmployeeLayout;
