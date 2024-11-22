import Sidenav from '@/app/ui/sidenav/sidenav';
import { NextPage } from 'next';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

const EmployeeLayout: NextPage<Props> = async ({ children }) => {
  return (
    <div className="">
      <Sidenav />
      <div className="p-10 ml-sidenav-width">
        <div className="flex flex-col items-start gap-2 font-bold">
          <h1 className="block mb-10 text-3xl font-bold">근무자 관리</h1>
          {children}
        </div>
      </div>
    </div>
  );
};

export default EmployeeLayout;
