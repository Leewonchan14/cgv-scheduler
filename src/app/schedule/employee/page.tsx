import EmployeeFallback from '@/app/schedule/employee/ui/EmployeeFallback';
import EmployeeList from '@/app/schedule/employee/ui/EmployeeTable';
import Search from '@/app/schedule/employee/ui/Search';
import TableMargin from '@/app/schedule/employee/ui/TableMargin';
import 'moment/locale/ko';
import { NextPage } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { z } from 'zod';
import './style.css';
import Link from 'next/link';

interface Props {
  searchParams: {
    page: string | undefined;
    pageSize: string | undefined;
    search: string | undefined;
  };
}

const Page: NextPage<Props> = async ({ searchParams }) => {
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
    <div className="flex flex-col gap-2 font-bold">
      <h1 className="block mb-10 text-3xl font-bold">근무자</h1>
      <div className="flex h-16 gap-4">
        <Search placeholder="근무자의 이름을 입력해 주세요" />
        <Link
          href={'./employee/create'}
          className="inline-flex items-center px-4 py-2 text-white bg-blue-500 rounded-lg"
        >
          근무자 추가
        </Link>
      </div>
      {/* display table */}
      <table className="w-full font-bold text-center employee">
        <thead className="font-bold text-white bg-blue-500">
          <tr>
            <th>이름</th>
            <th>가능한 근무</th>
            <th>근무 가능한 요일</th>
            <th>입사일</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <TableMargin margin={'h-6'} />
          <Suspense fallback={<EmployeeFallback />}>
            <EmployeeList {...parse.data} />
          </Suspense>
        </tbody>
      </table>
    </div>
  );
};

export default Page;
