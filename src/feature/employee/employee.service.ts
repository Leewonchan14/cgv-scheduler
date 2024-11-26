import { Employee } from '@/entity/employee.entity';
import { DeepPartial, Like, Repository } from 'typeorm';
import { DataSource } from 'typeorm/browser';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';
import { z } from 'zod';

export class EmployeeService {
  private static instance: EmployeeService | null = null;
  private employeeRepository: Repository<Employee>;

  public static getInstance = (appDataSource: DataSource) => {
    if (!EmployeeService.instance) {
      EmployeeService.instance = new EmployeeService(appDataSource);
    }
    return EmployeeService.instance;
  };

  public static PaginationSchema() {
    return z.object({
      page: z.coerce.number().optional().default(0),
      pageSize: z.coerce.number().min(0).max(10).optional().default(10),
      search: z.string().optional().default(''),
    });
  }

  constructor(private appDataSource: DataSource) {
    this.employeeRepository = this.appDataSource.getRepository(Employee);
  }

  findOne = (id: number) => {
    return this.employeeRepository.findOne({ where: { id } });
  };

  findByName = (name: string) => {
    return this.employeeRepository.findOne({ where: { name } });
  };
  findAll = (page: number, pageSize: number, search: string) => {
    return this.employeeRepository.findAndCount({
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
  remove = async (id: number) => {
    const findEmp = await this.employeeRepository.findOne({ where: { id } });
    if (!findEmp) {
      throw new Error('존재하지 않는 근무자입니다.');
    }
    findEmp.isDeleted = true;
    await this.employeeRepository.save(findEmp);
    return findEmp;
  };
  save = (employee: DeepPartial<Employee>) => {
    return this.employeeRepository.save(
      this.employeeRepository.create(employee),
    );
  };

  upsertWithName = async (entity: DeepPartial<Employee>) => {
    await this.employeeRepository.upsert(entity, ['name']);
    return;
  };

  update = async (
    id: number,
    partialEntity: QueryDeepPartialEntity<Employee>,
  ) => {
    await this.employeeRepository.update(
      { id },
      { ...partialEntity, isDeleted: false },
    );
  };
}

export const employeeService = EmployeeService.getInstance;
