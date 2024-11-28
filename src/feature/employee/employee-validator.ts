import { employeeService } from '@/feature/employee/employee.service';
import { appDataSource } from '@/share/libs/typerom/data-source';

class EmployeeValidator {
  async id(id: number) {
    return !!employeeService(await appDataSource()).findOne(id);
  }

  async name(name: string) {
    return await employeeService(await appDataSource()).isValidName(name);
  }
}

export const employeeValidator = new EmployeeValidator();
