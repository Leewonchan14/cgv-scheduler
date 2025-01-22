import { employeeCreateAction } from '@/app/employee/action';
import EmployeeEditForm from '@/app/employee/ui/EmployeeEditForm';
import { ERole } from '@/entity/enums/ERole';
import { authHandler } from '@/feature/auth/auth-handler';
import { nextCookieStore } from '@/feature/auth/next-cookie.store';
import { NextPage } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface Props {}

const EmployeeCreatePage: NextPage<Props> = async ({}) => {
  const session = await authHandler.getSession(nextCookieStore(cookies()));

  if (session?.role !== ERole.ADMIN) {
    redirect('/employee');
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="block text-3xl font-bold">근무자 추가</h1>
      <EmployeeEditForm action={employeeCreateAction} />
    </div>
  );
};

export default EmployeeCreatePage;
