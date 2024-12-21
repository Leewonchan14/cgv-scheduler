export class ScheduleErrorCounter {
  public counter: {
    '가능한 근무자가 없었던 근무표': { [k: string]: number };
    '최소 근무일이 많아서 배치가 힘든 근무자': { [k: number]: number };
    '최대 근무일이 적어서 배치가 힘든 근무자': { [k: number]: number };
  } = {
    '가능한 근무자가 없었던 근무표': {},
    '최대 근무일이 적어서 배치가 힘든 근무자': {},
    '최소 근무일이 많아서 배치가 힘든 근무자': {},
  };

  public countEmptyEmployee(entryId: string) {
    this.counter['가능한 근무자가 없었던 근무표'][entryId] =
      (this.counter['가능한 근무자가 없었던 근무표'][entryId] ?? 0) + 1;
  }

  public countNotValidAbleMax(employeeId: number) {
    this.counter['최대 근무일이 적어서 배치가 힘든 근무자'][employeeId] =
      (this.counter['최대 근무일이 적어서 배치가 힘든 근무자'][employeeId] ??
        0) + 1;
  }

  public countNotValidAbleMin(employeeId: number) {
    this.counter['최소 근무일이 많아서 배치가 힘든 근무자'][employeeId] =
      (this.counter['최소 근무일이 많아서 배치가 힘든 근무자'][employeeId] ??
        0) + 1;
  }
}
