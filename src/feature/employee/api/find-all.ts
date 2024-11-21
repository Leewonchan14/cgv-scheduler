import { Employee } from '@/entity/employee.entity';
import { dataSource } from '@/share/libs/typerom/data-source';
import { Like } from 'typeorm';

export const findAll = async (
  page: number,
  pageSize: number,
  search: string,
) => {
  const employeeRep = (await dataSource()).getRepository(Employee);

  return employeeRep.find({
    where: {
      name: Like(`%${search ?? ''}%`),
      isDeleted: false,
    },
    skip: page * pageSize,
    // TODO 나중에 페이지네이션 추가
    // take: pageSize,
    order: {
      createdAt: 'DESC',
    },
  });
};
