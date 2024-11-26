import EmployeeTable from '@/app/employee/ui/EmployeeTable';
import Search from '@/app/employee/ui/Search';
import LoadingAnimation from '@/app/ui/loading/loading-animation';
import { EmployeeService } from '@/feature/employee/employee.service';
import 'moment/locale/ko';
import { NextPage } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react';
import './style.css';

interface Props {
  searchParams: {
    page: number;
    pageSize: number;
    search: string;
  };
}

const EmployeePage: NextPage<Props> = async ({ searchParams }) => {
  const { success, data } =
    EmployeeService.PaginationSchema().safeParse(searchParams);

  if (!success) {
    notFound();
  }

  // const { page, pageSize, search } = data;

  // const response = await fetch('/api/employee');
  // console.log('await response.json(): ', await response.json());

  return (
    <React.Fragment>
      <div className="flex w-full h-16 gap-4">
        <Search placeholder="근무자의 이름을 입력해 주세요" />
        <Link
          href={'./employee/create'}
          className="inline-flex items-center px-4 py-2 text-white bg-blue-500 rounded-lg"
        >
          근무자 추가
        </Link>
      </div>
      <Suspense fallback={<LoadingAnimation text="" />}>
        <EmployeeTable {...data} />
      </Suspense>
    </React.Fragment>
  );
};

export default EmployeePage;
