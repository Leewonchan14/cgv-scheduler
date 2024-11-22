import { Employee } from '@/entity/employee.entity';
import { dataSource } from '@/share/libs/typerom/data-source';

export const findByName = async (name: string) => {
  const employeeRep = (await dataSource()).getRepository(Employee);
  return await employeeRep.findOne({ where: { name } });
};
