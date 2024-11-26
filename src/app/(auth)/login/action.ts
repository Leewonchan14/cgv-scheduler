'use server';

import { ERole } from '@/entity/enums/ERole';
import { CookieTokenHandler } from '@/feature/auth/cookie-handler';
import { jwtHandler } from '@/feature/auth/jwt-handler';
import { nextCookieStore } from '@/feature/auth/next-cookie.store';
import { pwHandler } from '@/feature/auth/pw-handler';
import { employeeService } from '@/feature/employee/employee.service';
import { appDataSource } from '@/share/libs/typerom/data-source';
import { cookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';
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

export const loginAction = async (prev: FormState, form: FormData) => {
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

  const findEmp = await employeeService(await appDataSource()).findByName(name);

  if (!findEmp || !pwHandler.compare(password, findEmp?.password)) {
    return {
      errors: {},
      message: '이름 또는 비밀번호가 일치하지 않습니다.',
    };
  }

  const token = await jwtHandler.createToken(findEmp.toPayload());
  const cookieTokenHandler = new CookieTokenHandler(nextCookieStore(cookies()));
  cookieTokenHandler.set(token);
  redirect('/employee', RedirectType.replace);
};

export const adminDevLogin = async (_formDate: FormData) => {
  await employeeService(await appDataSource()).upsertWithName({
    name: '조우철',
    password: pwHandler.encrypt('1234'),
    role: ERole.ADMIN,
  });
};

/* export const loginAction = async (
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

  const findEmp = await employeeService(await appDataSource()).findByName(name);

  if (!findEmp || !pwHandler.compare(password, findEmp?.password)) {
    return {
      errors: {},
      message: '이름 또는 비밀번호가 일치하지 않습니다.',
    };
  }

  const token = await jwtHandler.createToken(findEmp.toPayload());
  const cookieTokenHandler = new CookieTokenHandler(nextCookieStore(cookies()));
  cookieTokenHandler.set(token);
  redirect('/employee', RedirectType.replace);
}; */
