import { Employee } from '@/entity/employee.entity';
import { dataSource } from '@/share/libs/typerom/data-source';

export const idValidator = async (id: number) => {
  const employeeRep = (await dataSource()).getRepository(Employee);
  const findEmployee = await employeeRep.findOne({
    where: { id, isDeleted: false },
  });
  return !!findEmployee;
};
