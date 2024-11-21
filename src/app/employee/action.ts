'use server';

import { CORRECT_DAY_OF_WEEKS } from '@/entity/enums/EDayOfWeek';
import { EWORK_POSITION } from '@/entity/enums/EWorkPosition';
import { EWORK_TIMES } from '@/entity/enums/EWorkTime';
import { employeeService } from '@/feature/employee/api';
import { nameValidator } from '@/feature/employee/util/validator';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export const employeeRemoveAction = async ({ id }: { id: number }) => {
  await employeeService.remove(id);

  revalidatePath('/schedule/employee');
  redirect('/schedule/employee');
};

const FormSchema = z.object({
  name: z
    .string()
    .min(1, { message: '이름을 입력해주세요.' })
    .refine(nameValidator, { message: '이름은 중복될 수 없습니다.' }),
  ableWorkPosition: z.array(z.enum(EWORK_POSITION)),
  ableWorkTime: z.object(
    Object.fromEntries(
      CORRECT_DAY_OF_WEEKS.map((day) => [
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
  const parse = await FormSchema.safeParseAsync({
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

  await employeeService.save({
    name: parse.data.name,
    ableWorkPosition: parse.data.ableWorkPosition,
    ableWorkTime: Object.fromEntries(
      Object.entries(parse.data.ableWorkTime).filter(([, times]) => !!times),
    ),
  });

  revalidatePath('/employee');
  redirect('/employee');

  return prev;
};

export const employeeUpdateAction = async (
  prev: FormState,
  formData: FormData,
) => {
  const parse = await FormSchema.omit({ name: true })
    .extend({
      name: z.string().min(1, { message: '이름을 입력해주세요.' }),
      // TODO 관리자 또는 본인인지 확인하는 로직 추가 (관리자 또는 본인만 수정 가능)
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

  await employeeService.update(parse.data.id, {
    name: parse.data.name,
    ableWorkPosition: parse.data.ableWorkPosition,
    ableWorkTime: Object.fromEntries(
      Object.entries(parse.data.ableWorkTime).filter(([, times]) => !!times),
    ),
  });

  revalidatePath('/schedule/employee');
  redirect('/schedule/employee');
};
