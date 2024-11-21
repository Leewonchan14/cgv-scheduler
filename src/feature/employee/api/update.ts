import { Employee } from '@/entity/employee.entity';
import { dataSource } from '@/share/libs/typerom/data-source';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';

export const update = async (
  id: number,
  partialEntity: QueryDeepPartialEntity<Employee>,
) => {
  const employeeRep = (await dataSource()).getRepository(Employee);
  await employeeRep.update({ id }, { ...partialEntity, isDeleted: false });
};
