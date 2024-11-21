import DeleteButton from '@/app/schedule/employee/ui/DeleteButton';
import TableMargin from '@/app/schedule/employee/ui/TableMargin';
import { Employee } from '@/entity/employee.entity';
import { CORRECT_DAY_OF_WEEKS } from '@/entity/enums/EDayOfWeek';
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
  const employees: Employee[] = await employeeService.findAll(
    page ?? 0,
    pageSize ?? 10,
    search ?? '',
  );
  return (
    <React.Fragment>
      {employees.map((employee) => (
        <React.Fragment key={employee.id}>
          <tr className="bg-gray-100" key={employee.id}>
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
                className="inline-flex items-center h-12 px-4 mr-4 bg-blue-200 border-2 rounded-lg"
                href={`/schedule/employee/${employee.id}/update`}
              >
                수정
              </Link>
              <DeleteButton id={employee.id} />
            </td>
          </tr>
          <TableMargin margin={'h-2'} />
        </React.Fragment>
      ))}
    </React.Fragment>
  );
};

export default EmployeeList;
