import { Employee } from '@/entity/employee.entity';
import { dataSource } from '@/share/libs/typerom/data-source';

export const remove = async (id: number) => {
  const empRep = (await dataSource()).getRepository(Employee);
  const findEmp = await empRep.findOne({ where: { id } });
  if (!findEmp) {
    throw new Error('존재하지 않는 근무자입니다.');
  }
  findEmp.isDeleted = true;
  await empRep.save(findEmp);

  return findEmp;
};
