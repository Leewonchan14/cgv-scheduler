import SideNavLayout from '@/app/ui/sidenav/SideNavLayout';
import { NextPage } from 'next';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

const EmployeeLayout: NextPage<Props> = async ({ children }) => {
  return (
    <SideNavLayout>
      <div className="flex flex-col p-2 md:p-10 items-start gap-2 font-bold">
        <h1 className="block mb-10 text-3xl font-bold">근무자 관리</h1>
        {children}
      </div>
    </SideNavLayout>
  );
};

export default EmployeeLayout;
