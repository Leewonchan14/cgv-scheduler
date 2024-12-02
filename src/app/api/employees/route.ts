export const dynamic = 'force-dynamic';

import { IEmployee } from '@/entity/employee.entity';
import { ERole } from '@/entity/enums/ERole';
import { employeeService } from '@/feature/employee/employee.service';
import { appDataSource } from '@/share/libs/typerom/data-source';
import _ from 'lodash';

export async function GET() {
  const [employees, _total] = await employeeService(
    await appDataSource(),
  ).findAll(0, 30, '');

  const response = {
    data: employees
      .map((emp) => _.omit(emp, ['password']))
      .filter((emp) => emp.role !== ERole.ADMIN) as IEmployee[],
  };

  return Response.json(response);
}
