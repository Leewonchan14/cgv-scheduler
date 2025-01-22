import { employeeUpdateAction } from '@/app/employee/action';
import EmployeeEditForm from '@/app/employee/ui/EmployeeEditForm';
import { ERole } from '@/entity/enums/ERole';
import { authHandler } from '@/feature/auth/auth-handler';
import { nextCookieStore } from '@/feature/auth/next-cookie.store';
import { employeeService } from '@/feature/employee/employee.service';
import { appDataSource } from '@/share/libs/typerom/data-source';
import { NextPage } from 'next';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';

interface Props {
  params: {
    id?: string;
  };
}

const EmployeeUpdatePage: NextPage<Props> = async ({ params }) => {
  const session = await authHandler.getSession(nextCookieStore(cookies()));

  if (session?.role !== ERole.ADMIN) {
    redirect('/employee');
  }

  const SearchParamSchema = z.object({
    id: z.coerce.number(),
  });

  const parse = SearchParamSchema.safeParse(params);
  if (!parse.success) {
    return notFound();
  }
  const id = parse.data.id;
  const employee = await employeeService(await appDataSource()).findOne(id);

  if (!employee) {
    return notFound();
  }

  return (
    <EmployeeEditForm
      id={id}
      name={employee.name}
      ableWorkTime={employee.ableWorkTime}
      workPositions={employee.ableWorkPosition}
      action={employeeUpdateAction}
    />
  );
};
export default EmployeeUpdatePage;
