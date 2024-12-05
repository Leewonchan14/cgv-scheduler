'use server';

import { EDAY_OF_WEEKS_CORRECT } from '@/entity/enums/EDayOfWeek';
import { EWORK_POSITION } from '@/entity/enums/EWorkPosition';
import { EWORK_TIMES } from '@/entity/enums/EWorkTime';
import { employeeValidator } from '@/feature/employee/employee-validator';
import { employeeService } from '@/feature/employee/employee.service';
import { appDataSource } from '@/share/libs/typerom/data-source';
import _ from 'lodash';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export const employeeRemoveAction = async ({ id }: { id: number }) => {
  await employeeService(await appDataSource()).softDelete(id);

  revalidatePath('/employee');
  revalidatePath('/schedule');
  redirect('/employee');
};

const CreateFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: '이름을 입력해주세요.' })
    .refine(employeeValidator.name, { message: '이름은 중복될 수 없습니다.' }),
  ableWorkPosition: z.array(z.enum(EWORK_POSITION)),
  ableWorkTime: z.object(
    Object.fromEntries(
      EDAY_OF_WEEKS_CORRECT.map((day) => [
        day,
        z.array(z.enum(EWORK_TIMES)).optional(),
      ]),
    ),
  ),
});

export type FormState = {
  errors?: {
    name?: string[];
    ableWorkPosition?: string[];
    ableWorkTime?: string[];
  };
};

export const employeeCreateAction = async (
  prev: FormState,
  formData: FormData,
) => {
  const parse = await CreateFormSchema.safeParseAsync({
    name: formData.get('name'),
    ableWorkPosition: JSON.parse(formData.get('ableWorkPosition') as string),
    ableWorkTime: JSON.parse(formData.get('ableWorkTime') as string),
  });

  // TODO 관리자인지 확인하는 로직 추가 (관리자만 근무자 추가 가능)

  if (!parse.success) {
    return {
      ...prev,
      errors: parse.error.flatten().fieldErrors,
    };
  }

  const { name, ableWorkTime, ableWorkPosition } = parse.data;

  await employeeService(await appDataSource()).save({
    name,
    ableWorkPosition,
    ableWorkTime: _.omitBy(ableWorkTime, _.isUndefined),
  });

  revalidatePath('/employee');
  revalidatePath('/schedule');
  redirect('/employee');
};

export const employeeUpdateAction = async (
  prev: FormState,
  formData: FormData,
) => {
  const parse = await CreateFormSchema.omit({ name: true })
    .extend({
      name: z.string().min(1, { message: '이름을 입력해주세요.' }),
      id: z.coerce.number(),
    })
    .safeParseAsync({
      id: formData.get('id'),
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

  const { id, name, ableWorkTime, ableWorkPosition } = parse.data;

  await employeeService(await appDataSource()).update(id, {
    name,
    ableWorkPosition,
    ableWorkTime: _.omitBy(ableWorkTime, _.isUndefined),
  });

  revalidatePath('/employee');
  revalidatePath('/schedule');
  redirect('/employee');
};
