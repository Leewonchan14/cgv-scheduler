import { Employee } from '@/entity/employee.entity';
import { 암호화 } from '@/feature/employee/util/jwt';
import { dataSource } from '@/share/libs/typerom/data-source';

export const findWithPw = async (name: string, password: string) => {
  const employeeRep = (await dataSource()).getRepository(Employee);
  const encodePassword = 암호화(password);
  return employeeRep.findOne({
    where: { name, password: encodePassword },
  });
};
