import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { IEmployeeSchemaType, UserInputCondition } from '@/entity/types';

export class ScheduleCounter {
  private employeeCounter: Record<number, number> = {};
  private totalWorkCnt = 0;
  constructor(workConditionOfWeek: UserInputCondition['workConditionOfWeek']) {
    for (const day in workConditionOfWeek) {
      const entry = workConditionOfWeek[day as EDayOfWeek];
      if (!entry) continue;
      for (const workConEntry of entry) {
        // 총 근무 갯수 count
        this.totalWorkCnt++;
        if (workConEntry.employee) {
          // 이미 배치된 근무자라면 count
          this.employeeCounter[workConEntry.employee.id] =
            (this.employeeCounter[workConEntry.employee.id] ?? 0) + 1;
        }
      }
    }
  }
  public getEmployeeCnt(employee: IEmployeeSchemaType) {
    return this.employeeCounter[employee.id] ?? 0;
  }

  public countEmployee(employee: IEmployeeSchemaType) {
    this.employeeCounter[employee.id] ??= 0;
    this.employeeCounter[employee.id]++;
    return this.employeeCounter[employee.id];
  }

  public discountEmployee(employee?: IEmployeeSchemaType) {
    if (!employee) return;
    this.employeeCounter[employee.id]--;
    return this.employeeCounter[employee.id];
  }

  public getTotalWorkCnt() {
    return this.totalWorkCnt;
  }
}
