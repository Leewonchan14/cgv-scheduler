'use client';

import {
  notFound,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { ZodType } from 'zod';

export const useQueryParam = <T>(schema: ZodType<T>, key: string) => {
  const pathname = usePathname();
  const params = useSearchParams();
  const prev = Object.fromEntries(params.entries());
  const router = useRouter();

  const newLocal = params.get(key) ?? undefined;
  const { success, data } = schema.safeParse(newLocal);

  if (!success) {
    notFound();
  }

  const set = (data: string) => {
    const query = new URLSearchParams({ ...prev, [key]: data }).toString();
    router.replace(`${pathname}?${query}`);
  };

  return [data!, set] as const;
};
