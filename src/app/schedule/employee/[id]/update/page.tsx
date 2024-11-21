import { employeeUpdateAction } from '@/app/schedule/employee/action';
import EmployeeEditForm from '@/app/schedule/employee/ui/EmployeeEditForm';
import { employeeService } from '@/feature/employee/api';
import { NextPage } from 'next';
import { notFound } from 'next/navigation';
import { z } from 'zod';

interface Props {
  params: {
    id?: string;
  };
}

const EmployeeUpdatePage: NextPage<Props> = async ({ params }) => {
  const SearchParamSchema = z.object({
    id: z.coerce.number(),
  });

  const parse = SearchParamSchema.safeParse(params);
  if (!parse.success) {
    return notFound();
  }
  const id = parse.data.id;
  const employee = await employeeService.findOne(id);

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
