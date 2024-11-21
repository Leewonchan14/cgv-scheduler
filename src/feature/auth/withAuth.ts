'use server';

import { ERole } from '@/entity/enums/ERole';
import { currentEmployee } from '@/feature/auth/current-employee';
import { redirect } from 'next/navigation';

export const withAuth = async (roles: ERole[]) => {
  const employee = await currentEmployee();
  if (!employee || !roles.includes(employee.role)) {
    redirect('/login');
  }

  return employee;
};
