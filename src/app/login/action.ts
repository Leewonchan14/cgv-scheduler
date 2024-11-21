"use server";

import { employeeService } from '@/feature/employee/api';
import { jwtUtil } from '@/feature/employee/util';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

type FormState = {
  errors?: {
    name?: string[];
    password?: string[];
  };
  message?: string;
};

const LoginFormSchema = z.object({
  name: z.string().min(1, { message: '이름을 입력해 주세요' }),
  password: z.string().min(1, { message: '비밀번호를 입력해 주세요' }),
});

export const loginAction = async (
  prev: FormState,
  form: FormData,
): Promise<FormState> => {
  const parse = LoginFormSchema.safeParse({
    name: form.get('name') as string,
    password: form.get('password') as string,
  });

  if (!parse.success) {
    return {
      ...prev,
      errors: parse.error.flatten().fieldErrors,
    } as FormState;
  }

  const { name, password } = parse.data;

  const findEmp = await employeeService.findWithPw(name, password);

  if (!findEmp) {
    return {
      ...prev,
      message: '이름 또는 비밀번호가 일치하지 않습니다.',
    };
  }

  const token = await jwtUtil.create({ id: findEmp.id });
  jwtUtil.set(token);

  revalidatePath('/employee');
  redirect('/employee');

  return prev;
};
