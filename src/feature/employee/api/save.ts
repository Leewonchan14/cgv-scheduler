import { Employee } from '@/entity/employee.entity';
import { dataSource } from '@/share/libs/typerom/data-source';
import { DeepPartial } from 'typeorm';

export const save = async (employee: DeepPartial<Employee>) => {
  const empRep = (await dataSource()).getRepository(Employee);
  return empRep.save(empRep.create(employee));
};
