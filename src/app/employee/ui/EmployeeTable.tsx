import DeleteButton from '@/app/employee/ui/DeleteButton';
import TableMargin from '@/app/employee/ui/TableMargin';
import { EDAY_OF_WEEKS_CORRECT } from '@/entity/enums/EDayOfWeek';
import { ERole } from '@/entity/enums/ERole';
import { authHandler } from '@/feature/auth/auth-handler';
import { nextCookieStore } from '@/feature/auth/next-cookie.store';
import { employeeService } from '@/feature/employee/employee.service';
import { appDataSource } from '@/share/libs/typerom/data-source';
import moment from 'moment';
import { NextPage } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import React from 'react';

interface Props {
  page: number;
  pageSize: number;
  search: string;
}

const EmployeeTable: NextPage<Props> = async ({ page, pageSize, search }) => {
  const me = await authHandler.getSession(nextCookieStore(cookies()))!;

  // TODO total 사용해야함
  const [employees, _total] = await employeeService(
    await appDataSource(),
  ).findAll(page, pageSize, search);

  const isAdmin = me?.role === ERole.ADMIN;

  return (
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
        {/* <EmployeeList {...data} /> */}
        {employees
          .filter((e) => e.role !== ERole.ADMIN)
          .map((employee) => (
            <React.Fragment key={employee.id}>
              <tr className="bg-gray-200" key={employee.id}>
                <td>{employee.name}</td>
                <td>
                  {employee.ableWorkPosition.map((po) => (
                    <div key={po}>{po}</div>
                  ))}
                </td>
                <td>
                  {EDAY_OF_WEEKS_CORRECT.map((day) => {
                    const workTimes = employee.ableWorkTime[day];
                    if (workTimes && workTimes.length > 0) {
                      return (
                        <div key={day}>
                          <strong>{day}:</strong> {workTimes.join(', ')}
                        </div>
                      );
                    }
                  })}
                </td>
                <td>{moment(employee.createdAt).format('L')}</td>
                <td className="">
                  <div className="flex flex-col items-center justify-center">
                    <Link
                      className={`flex items-center justify-center w-20 h-12 px-4 bg-blue-200 border-2 rounded-lg
                  ${!(isAdmin || me?.id === employee.id) && 'invisible'}`}
                      href={`/employee/${employee.id}/update`}
                    >
                      수정
                    </Link>
                    <DeleteButton
                      isAdmin={isAdmin}
                      name={employee.name}
                      id={employee.id}
                    />
                  </div>
                </td>
              </tr>
              <TableMargin margin={'h-2'} />
            </React.Fragment>
          ))}
      </tbody>
    </table>
  );
};

export default EmployeeTable;
