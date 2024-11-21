import { jwt } from '@/feature/employee/util/jwt';
import { idValidator } from '@/feature/employee/util/validator';

export const employeeValidator = {
  id: idValidator,
};

export const jwtUtil = jwt;
