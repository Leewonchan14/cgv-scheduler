import { employeeService } from '@/feature/employee/api';
import { jwtUtil } from '@/feature/employee/util';

export const currentEmployee = async () => {
  const token = jwtUtil.get();
  if (!token) return null;

  const payload = await jwtUtil.decode(token);
  if (!payload?.id) return null;

  return employeeService.findOne(payload.id);
};
