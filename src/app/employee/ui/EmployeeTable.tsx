import DeleteButton from '@/app/employee/ui/DeleteButton';
import { Employee } from '@/entity/employee.entity';
import { EDAY_OF_WEEKS_CORRECT } from '@/entity/enums/EDayOfWeek';
import { ERole } from '@/entity/enums/ERole';
import { authHandler } from '@/feature/auth/auth-handler';
import { IPayLoad } from '@/feature/auth/jwt-handler';
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
    <div className="grid w-full grid-cols-2 gap-4 py-4 md:grid-cols-4">
      {employees
        .filter((e) => e.role !== ERole.ADMIN)
        .map((employee) => (
          <EmployeeCard
            key={employee.id}
            me={me}
            employee={employee}
            isAdmin={isAdmin}
          />
        ))}
    </div>
  );
};

interface EmployeeCardProps {
  employee: Employee;
  me: IPayLoad | null;
  isAdmin: boolean;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  isAdmin,
  me,
}) => {
  const isMine = me?.id === employee.id;
  return (
    <div
      key={employee.id}
      className="flex flex-col justify-between p-4 md:p-6 bg-white rounded-lg shadow-xl shadow-slate-300"
    >
      <div>
        <h2 className="text-xl font-semibold text-blue-500">{employee.name}</h2>
        <p className="mt-2">
          <strong>가능한 근무:</strong>
          <span className="ml-1 flex flex-col md:flex-row text-gray-700">
            {employee.ableWorkPosition.map((position) => (
              <span key={position} className="mr-1">
                {position}
              </span>
            ))}
          </span>
        </p>
        <div className="mt-2">
          <strong>근무 가능한 요일:</strong>
          {EDAY_OF_WEEKS_CORRECT.map((day) => {
            const workTimes = employee.ableWorkTime[day];
            if (workTimes && workTimes.length > 0) {
              return (
                <div key={day} className="mt-1">
                  <span className="font-medium">{day}:</span>{' '}
                  {workTimes.join(', ')}
                </div>
              );
            }
            return null;
          })}
        </div>
        <p className="mt-2">
          <strong>입사일:</strong> {moment(employee.createdAt).format('L')}
        </p>
      </div>
      <div
        className={`flex items-center mt-4 justify-evenly invisible ${(isMine || isAdmin) && '!visible'}`}
      >
        <Link
          className={`flex items-center justify-center w-20 h-12 px-4 bg-blue-200 border-2 rounded-lg`}
          href={`/employee/${employee.id}/update`}
        >
          수정
        </Link>
        <DeleteButton isAdmin={isAdmin} name={employee.name} id={employee.id} />
      </div>
    </div>
  );
};

export default EmployeeTable;
