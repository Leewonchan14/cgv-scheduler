import { EmployeeCondition } from '@/entity/types';
import _ from 'lodash';

export type FilteredEmployeeCon = {
  message: string;
  employeeConditions: EmployeeCondition;
};

export class FilterEmployee {
  filters: FilteredEmployeeCon[] = [];

  constructor(filters: FilteredEmployeeCon[] = []) {
    this.filters = filters;
  }

  public addFilters(
    isAble: boolean,
    message: string,
    employeeConditions: EmployeeCondition,
  ) {
    // 필터링 되지 않았다면 return
    if (isAble) return;

    // 이미 필터링 되었다면 return
    if (
      _.some(this.filters, {
        employeeConditions: {
          employee: { id: employeeConditions.employee.id },
        },
      })
    )
      return;

    this.filters.push({ message, employeeConditions });
  }

  public getFilters() {
    return this.filters;
  }
}
