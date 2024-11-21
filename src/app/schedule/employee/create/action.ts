'use server';

import { Employee } from '@/entity/employee.entity';
import { CORRECT_DAY_OF_WEEKS } from '@/entity/enums/EDayOfWeek';
import { EWORK_POSITION } from '@/entity/enums/EWorkPosition';
import { EWORK_TIMES } from '@/entity/enums/EWorkTime';
import { dataSource } from '@/share/libs/typerom/data-source';
import { z } from 'zod';

const nameValidator = async (name: string) => {
  const employeeRep = (await dataSource()).getRepository(Employee);
  const findEmployee = await employeeRep.findOne({
    where: { name, isDeleted: false },
  });
  return !findEmployee;
};

const FormSchema = z.object({
  name: z.string().refine(nameValidator, { message: '중복된 이름입니다.' }),
  ableWorkPosition: z.array(z.enum(EWORK_POSITION)),
  ableWorkTime: z.object(
    Object.fromEntries(
      CORRECT_DAY_OF_WEEKS.map((day) => [day, z.array(z.enum(EWORK_TIMES))]),
    ),
  ),
});

type FormState = {
  errors?: {
    name?: string[];
    ableWorkPosition?: string[];
    ableWorkTime?: string[];
  };
};

export const createEmployee = async (prev: FormState, formData: FormData) => {
  const parse = await FormSchema.safeParseAsync({
    name: formData.get('name'),
    ableWorkPosition: JSON.parse(formData.get('ableWorkPosition') as string),
    ableWorkTime: JSON.parse(formData.get('ableWorkTime') as string),
  });

  if (!parse.success) {
    return {
      ...prev,
      errors: parse.error.flatten().fieldErrors,
    };
  }

  return prev;
};
