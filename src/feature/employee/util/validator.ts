import { Employee } from '@/entity/employee.entity';
import { dataSource } from '@/share/libs/typerom/data-source';

export const nameValidator = async (name: string) => {
  const employeeRep = (await dataSource()).getRepository(Employee);
  const findEmployee = await employeeRep.findOne({
    where: { name },
  });
  if (findEmployee) {
    return false;
  }
  return true;
};

export const idValidator = async (id: number) => {
  const employeeRep = (await dataSource()).getRepository(Employee);
  const findEmployee = await employeeRep.findOne({
    where: { id, isDeleted: false },
  });
  return !!findEmployee;
};
