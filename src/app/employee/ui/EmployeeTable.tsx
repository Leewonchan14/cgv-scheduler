import DeleteButton from '@/app/employee/ui/DeleteButton';
import TableMargin from '@/app/employee/ui/TableMargin';
import { Employee } from '@/entity/employee.entity';
import { CORRECT_DAY_OF_WEEKS } from '@/entity/enums/EDayOfWeek';
import { ERole } from '@/entity/enums/ERole';
import { currentEmployee } from '@/feature/auth';
import { employeeService } from '@/feature/employee/api';
import moment from 'moment';
import { NextPage } from 'next';
import Link from 'next/link';
import React from 'react';

interface Props {
  page?: number;
  pageSize?: number;
  search?: string;
}

const EmployeeList: NextPage<Props> = async ({ page, pageSize, search }) => {
  const me = await currentEmployee()!;

  const isAdmin = me?.role === ERole.ADMIN;

  const employees: Employee[] = await employeeService.findAll(
    page ?? 0,
    pageSize ?? 10,
    search ?? '',
  );

  // const employees: Employee[] = [];
  return (
    <React.Fragment>
      {employees.map((employee) => (
        <React.Fragment key={employee.id}>
          <tr className="bg-gray-200" key={employee.id}>
            <td>{employee.name}</td>
            <td>{employee.ableWorkPosition.join(', ')}</td>
            <td>
              {CORRECT_DAY_OF_WEEKS.filter(
                (d) => d in employee.ableWorkTime,
              ).join(',')}
            </td>
            <td>{moment(employee.createdAt).format('L')}</td>
            <td className="overflow-clip">
              <Link
                className={`inline-flex items-center h-12 px-4 mr-4 bg-blue-200 border-2 rounded-lg
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
            </td>
          </tr>
          <TableMargin margin={'h-2'} />
        </React.Fragment>
      ))}
    </React.Fragment>
  );
};

export default EmployeeList;
