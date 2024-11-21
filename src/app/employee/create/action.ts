// 'use server';

// import { dataSource } from '@/typeorm/data-source';
// import { Employee } from '@/typeorm/entity/employee.entity';
// import { WorkType } from '@/typeorm/entity/worktype.entity';
// import { DayOfWeek } from '@/typeorm/enum/DayOfWeek';
// import { z } from 'zod';

// const [_one, ...DayOfWeekArr] = Object.values(DayOfWeek);

// const FormSchema = z.object({
//   name: z.string().refine(
//     async (v) => {
//       const employeeRep = (await dataSource()).getRepository(Employee);
//       const findEmployee = await employeeRep.findOne({ where: { name: v } });
//       return !findEmployee;
//     },
//     { message: '중복된 이름입니다.' },
//   ),
//   availableWorkTypes: z.array(z.string()),
//   fixedDayOff: z.array(z.enum([_one, ...DayOfWeekArr])),
// });

// type FormType = z.infer<typeof FormSchema>;

// type FormState = {
//   errors?: {
//     name?: string[];
//     availableWorkTypes?: string[];
//     fixedDayOff?: string[];
//   };
// };

// export const createEmployee = async (prev: FormState, formData: FormData) => {
//   const parse = await FormSchema.safeParseAsync({
//     name: formData.get('name'),
//     availableWorkTypes: JSON.parse(
//       formData.get('availableWorkTypes') as string,
//     ),
//     fixedDayOff: JSON.parse(formData.get('fixedDayOff') as string),
//   });

//   if (!parse.success) {
//     return {
//       ...prev,
//       errors: parse.error.flatten().fieldErrors,
//     };
//   }

//   return prev;
// };
