import { EmployeeCondition } from '@/entity/types';
import _ from 'lodash';

export interface FilteredEmployees {
  '가능한 근무자': EmployeeCondition[];
}

export class FilterEmployee {
  filterEmployees: FilteredEmployees;

  constructor(filters: FilteredEmployees) {
    this.filterEmployees = filters;
  }

  public addFilters(
    isAble: boolean,
    conditionKey: keyof FilteredEmployees,
    employeeConditions: EmployeeCondition,
  ) {
    // 필터링 되지 않았다면 return
    if (isAble) return;

    // 이미 필터링 되었다면 return
    const preFiltered = _.chain(
      this.filterEmployees as Record<
        keyof FilteredEmployees,
        EmployeeCondition[]
      >,
    )
      .omit('가능한 근무자')
      .values()
      .flatten()
      .some({ employee: { id: employeeConditions.employee.id } })
      .value();

    if (preFiltered) return;

    (this.filterEmployees[conditionKey] ??= []).push(employeeConditions);
  }

  public getFilters() {
    return this.filterEmployees;
  }
}
