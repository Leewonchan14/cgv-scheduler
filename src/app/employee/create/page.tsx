import { employeeCreateAction } from '@/app/employee/action';
import EmployeeEditForm from '@/app/employee/ui/EmployeeEditForm';
import { NextPage } from 'next';

interface Props {}

const EmployeeCreatePage: NextPage<Props> = ({}) => {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="block text-3xl font-bold">근무자 추가</h1>
      <EmployeeEditForm action={employeeCreateAction} />
    </div>
  );
};

export default EmployeeCreatePage;
