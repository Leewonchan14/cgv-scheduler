import EmployeeFallback from '@/app/employee/ui/EmployeeFallback';
import EmployeeList from '@/app/employee/ui/EmployeeTable';
import Search from '@/app/employee/ui/Search';
import TableMargin from '@/app/employee/ui/TableMargin';
import { ERole } from '@/entity/enums/ERole';
import { withAuth } from '@/feature/auth';
import 'moment/locale/ko';
import { NextPage } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react';
import { z } from 'zod';
import './style.css';

interface Props {
  searchParams: {
    page: string | undefined;
    pageSize: string | undefined;
    search: string | undefined;
  };
}

const EmployeePage: NextPage<Props> = async ({ searchParams }) => {
  await withAuth([ERole.EMPLOYEE, ERole.ADMIN]);

  const SearchParamSchema = z.object({
    page: z.coerce.number().optional(),
    pageSize: z.coerce.number().min(0).max(10).optional(),
    search: z.string().optional(),
  });

  const parse = SearchParamSchema.safeParse(searchParams);

  if (!parse.success) {
    notFound();
  }

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
      <table className="w-full font-bold text-center employee">
        <colgroup>
          <col style={{ width: '10%' }} />
          <col style={{ width: '30%' }} />
          <col style={{ width: '30%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '20%' }} />
        </colgroup>
        <thead className="font-bold text-white bg-blue-500">
          <tr>
            <th>이름</th>
            <th>가능한 근무</th>
            <th>근무 가능한 요일</th>
            <th>입사일</th>
            <th>수정</th>
          </tr>
        </thead>
        <tbody>
          <TableMargin margin={'h-6'} />
          <Suspense fallback={<EmployeeFallback />}>
            <EmployeeList {...parse.data} />
          </Suspense>
        </tbody>
      </table>
    </React.Fragment>
  );
};

export default EmployeePage;
