import { Employee } from '@/entity/employee.entity';
import { dataSource } from '@/share/libs/typerom/data-source';

export const findOne = async (id: number) => {
  const employeeRep = (await dataSource()).getRepository(Employee);
  const findEmp = await employeeRep.findOne({ where: { id } });
  return findEmp;
};
