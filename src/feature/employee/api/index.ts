import { findAll } from '@/feature/employee/api/find-all';
import { findOne } from '@/feature/employee/api/find-one';
import { remove } from '@/feature/employee/api/remove';
import { save } from '@/feature/employee/api/save';
import { update } from '@/feature/employee/api/update';

export const employeeService = { findAll, remove, update, findOne, save };
